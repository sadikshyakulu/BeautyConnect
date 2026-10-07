using BeautyConnect.Core.Entities;
using Microsoft.Extensions.Logging;

namespace BeautyConnect.Infrastructure.Services;

public static class BookingScheduleValidator
{
    private static readonly TimeZoneInfo NepalTimeZone = ResolveNepalTimeZone();

    public static DateTimeOffset ToNepalDateTimeOffset(DateTime localDateTime)
    {
        var unspecifiedDateTime = DateTime.SpecifyKind(localDateTime, DateTimeKind.Unspecified);
        return new DateTimeOffset(
            unspecifiedDateTime,
            NepalTimeZone.GetUtcOffset(unspecifiedDateTime));
    }

    public static DateTimeOffset GetNepalNow() =>
        TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, NepalTimeZone);

    public static bool TryPrepare(
        DateTimeOffset requestedStart,
        int durationMinutes,
        DateTimeOffset now,
        out BookingSchedule schedule,
        out string? error,
        ILogger? logger = null)
    {
        schedule = default;
        error = null;

        if (requestedStart == default)
        {
            error = "A booking date and time are required.";
            return false;
        }

        if (requestedStart <= now)
        {
            error = "Booking time must be in the future.";
            return false;
        }

        if (durationMinutes <= 0)
        {
            error = "Service duration must be greater than zero.";
            return false;
        }

        if (durationMinutes >= 24 * 60)
        {
            error = "Service duration must be less than 24 hours to fit within one local-day availability slot.";
            return false;
        }

        var requestedStartNepal = TimeZoneInfo.ConvertTime(requestedStart, NepalTimeZone);
        var localStartOffset = requestedStartNepal;
        var localEndOffset = TimeZoneInfo.ConvertTime(
            requestedStart.AddMinutes(durationMinutes),
            NepalTimeZone);
        var localStart = requestedStartNepal.DateTime;
        var localEnd = localEndOffset.DateTime;

        Console.WriteLine(
            $"BOOKING DEBUG | Requested={requestedStart:O} | " +
            $"UTC={requestedStart.UtcDateTime:O} | " +
            $"NepalStart={localStartOffset:O} | " +
            $"NepalEnd={localEndOffset:O}");

        logger?.LogInformation(
            "Booking schedule validation: requestedStart={RequestedStart:O}, requestedStartUtc={RequestedStartUtc:O}, requestedStartNepal={RequestedStartNepal:O}, durationMinutes={DurationMinutes}, localStart={LocalStart:yyyy-MM-dd HH:mm:ss}, localEnd={LocalEnd:yyyy-MM-dd HH:mm:ss}, localStartDate={LocalStartDate:yyyy-MM-dd}, localEndDate={LocalEndDate:yyyy-MM-dd}",
            requestedStart,
            requestedStart.UtcDateTime,
            requestedStartNepal,
            durationMinutes,
            localStart,
            localEnd,
            DateOnly.FromDateTime(localStart),
            DateOnly.FromDateTime(localEnd));

        Console.WriteLine(
            $"BOOKING DEBUG | Start={localStart:O} | End={localEnd:O} | " +
            $"StartDate={localStart.Date:yyyy-MM-dd} | " +
            $"EndDate={localEnd.Date:yyyy-MM-dd} | " +
            $"DurationMinutes={durationMinutes}");

        if (DateOnly.FromDateTime(localStart) != DateOnly.FromDateTime(localEnd))
        {
            error = "Booking must fit within one local-day availability slot.";
            return false;
        }

        schedule = new BookingSchedule(
            DateTime.SpecifyKind(localStart, DateTimeKind.Unspecified),
            DateTime.SpecifyKind(localEnd, DateTimeKind.Unspecified));
        return true;
    }

    public static bool FitsAvailabilitySlot(
        IEnumerable<Availability> availabilitySlots,
        BookingSchedule schedule)
    {
        var bookingDate = DateOnly.FromDateTime(schedule.LocalStart);
        var specificDateSlots = availabilitySlots
            .Where(slot => slot.SpecificDate == bookingDate)
            .ToList();

        var candidateSlots = specificDateSlots.Count > 0
            ? specificDateSlots
            : availabilitySlots
                .Where(slot => slot.SpecificDate == null
                    && slot.DayOfWeek == bookingDate.DayOfWeek)
                .ToList();

        var bookingStartTime = TimeOnly.FromDateTime(schedule.LocalStart);
        var bookingEndTime = TimeOnly.FromDateTime(schedule.LocalEnd);
        return candidateSlots.Any(slot =>
            slot.IsAvailable
            && slot.StartTime <= bookingStartTime
            && slot.EndTime >= bookingEndTime);
    }

    private static TimeZoneInfo ResolveNepalTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Nepal Standard Time");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Kathmandu");
        }
    }
}

public readonly record struct BookingSchedule(DateTime LocalStart, DateTime LocalEnd);
