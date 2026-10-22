using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly BeautyConnectDbContext _context;

    public AvailabilityService(BeautyConnectDbContext context)
    {
        _context = context;
    }

    public async Task<List<AvailabilityDto>?> GetMyAvailabilityAsync(int userId)
    {
        var profileId = await _context.ProfessionalProfiles
            .Where(profile => profile.UserId == userId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync();

        if (profileId == null)
        {
            return null;
        }

        return await _context.Availabilities
            .AsNoTracking()
            .Where(availability => availability.ProfessionalProfileId == profileId.Value)
            .OrderBy(availability => availability.SpecificDate)
            .ThenBy(availability => availability.DayOfWeek)
            .ThenBy(availability => availability.StartTime)
            .Select(availability => ToDto(availability))
            .ToListAsync();
    }

    public async Task<(AvailabilityDto? Availability, string? Error)> CreateAsync(
        int userId,
        AvailabilityUpsertDto dto)
    {
        var profileId = await _context.ProfessionalProfiles
            .Where(profile => profile.UserId == userId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync();

        if (profileId == null)
        {
            return (null, "Professional profile not found.");
        }

        var validationError = ValidateSchedule(dto);
        if (validationError != null)
        {
            return (null, validationError);
        }

        if (await HasOverlappingSlotAsync(profileId.Value, dto, null))
        {
            return (null, "This time overlaps an existing availability slot.");
        }

        var availability = new Availability
        {
            ProfessionalProfileId = profileId.Value,
            DayOfWeek = dto.DayOfWeek,
            SpecificDate = dto.SpecificDate,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            IsAvailable = dto.IsAvailable
        };

        _context.Availabilities.Add(availability);
        await _context.SaveChangesAsync();
        return (ToDto(availability), null);
    }

    public async Task<(AvailabilityDto? Availability, string? Error)> UpdateAsync(
        int userId,
        int availabilityId,
        AvailabilityUpsertDto dto)
    {
        var availability = await _context.Availabilities
            .Include(item => item.ProfessionalProfile)
            .FirstOrDefaultAsync(item =>
                item.Id == availabilityId && item.ProfessionalProfile.UserId == userId);

        if (availability == null)
        {
            return (null, "Availability slot not found.");
        }

        var validationError = ValidateSchedule(dto);
        if (validationError != null)
        {
            return (null, validationError);
        }

        if (await HasOverlappingSlotAsync(
                availability.ProfessionalProfileId,
                dto,
                availabilityId))
        {
            return (null, "This time overlaps an existing availability slot.");
        }

        availability.DayOfWeek = dto.DayOfWeek;
        availability.SpecificDate = dto.SpecificDate;
        availability.StartTime = dto.StartTime;
        availability.EndTime = dto.EndTime;
        availability.IsAvailable = dto.IsAvailable;

        await _context.SaveChangesAsync();
        return (ToDto(availability), null);
    }

    public async Task<(List<OpenAvailabilitySlotDto>? Slots, string? Error)> GetOpenSlotsAsync(
        int professionalProfileId,
        DateOnly date,
        int durationMinutes)
    {
        if (durationMinutes is < 1 or >= 24 * 60)
        {
            return (null, "Service duration must be between 1 and 1439 minutes.");
        }

        var profileExists = await _context.ProfessionalProfiles
            .AnyAsync(profile => profile.Id == professionalProfileId);
        if (!profileExists)
        {
            return (null, "Professional profile not found.");
        }

        var hasSpecificDateOverride = await _context.Availabilities
            .AnyAsync(availability =>
                availability.ProfessionalProfileId == professionalProfileId
                && availability.SpecificDate == date);

        var availability = await _context.Availabilities
            .AsNoTracking()
            .Where(availability =>
                availability.ProfessionalProfileId == professionalProfileId
                && availability.IsAvailable
                && (hasSpecificDateOverride
                    ? availability.SpecificDate == date
                    : availability.SpecificDate == null && availability.DayOfWeek == date.DayOfWeek))
            .OrderBy(availability => availability.StartTime)
            .ToListAsync();
        var mergedWindows = new List<(TimeOnly Start, TimeOnly End, int Id)>();
        foreach (var window in availability)
        {
            if (mergedWindows.Count > 0 && window.StartTime <= mergedWindows[^1].End)
            {
                var previous = mergedWindows[^1];
                mergedWindows[^1] = (
                    previous.Start,
                    window.EndTime > previous.End ? window.EndTime : previous.End,
                    previous.Id);
            }
            else
            {
                mergedWindows.Add((window.StartTime, window.EndTime, window.Id));
            }
        }

        var localDayStart = date.ToDateTime(TimeOnly.MinValue);
        var localDayEnd = localDayStart.AddDays(1);
        var bookings = await _context.Bookings
            .AsNoTracking()
            .Where(booking =>
                booking.ProfessionalProfileId == professionalProfileId
                && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed)
                && booking.ScheduledDateTime < localDayEnd
                && booking.EndDateTime > localDayStart)
            .Select(booking => new { booking.ScheduledDateTime, booking.EndDateTime })
            .ToListAsync();
        var now = DateTime.UtcNow;
        var paymentIntents = await _context.PaymentIntents
            .AsNoTracking()
            .Where(paymentIntent =>
                paymentIntent.ProfessionalProfileId == professionalProfileId
                && paymentIntent.Status == PaymentIntentStatus.Pending
                && paymentIntent.ExpiresAt > now
                && paymentIntent.ScheduledDateTime < localDayEnd
                && paymentIntent.EndDateTime > localDayStart)
            .Select(paymentIntent => new { paymentIntent.ScheduledDateTime, paymentIntent.EndDateTime })
            .ToListAsync();

        var nepalNow = BookingScheduleValidator.GetNepalNow();
        var isToday = date == DateOnly.FromDateTime(nepalNow.DateTime);
        var currentTime = TimeOnly.FromDateTime(nepalNow.DateTime);
        var slotStarts = new HashSet<TimeOnly>();
        foreach (var window in mergedWindows)
        {
            var windowStartMinutes = window.Start.Hour * 60 + window.Start.Minute;
            var windowEndMinutes = window.End.Hour * 60 + window.End.Minute;
            for (var candidateMinutes = windowStartMinutes;
                 candidateMinutes + durationMinutes <= windowEndMinutes;
                 candidateMinutes += 30)
            {
                var candidate = new TimeOnly(candidateMinutes / 60, candidateMinutes % 60);
                if (!isToday || candidate > currentTime)
                {
                    var start = date.ToDateTime(candidate);
                    var end = start.AddMinutes(durationMinutes);
                    var conflictsWithBooking = bookings.Any(booking =>
                        booking.ScheduledDateTime < end && booking.EndDateTime > start);
                    var conflictsWithPayment = paymentIntents.Any(paymentIntent =>
                        paymentIntent.ScheduledDateTime < end && paymentIntent.EndDateTime > start);

                    if (!conflictsWithBooking && !conflictsWithPayment)
                    {
                        slotStarts.Add(candidate);
                    }
                }
            }
        }

        var slots = slotStarts
            .OrderBy(start => start)
            .Select(start => new OpenAvailabilitySlotDto
            {
                AvailabilityId = mergedWindows
                    .First(window => window.Start <= start
                        && window.End >= start.AddMinutes(durationMinutes)).Id,
                Date = date,
                StartTime = start,
                EndTime = start.AddMinutes(durationMinutes)
            })
            .ToList();

        return (slots, null);
    }

    private async Task<bool> HasOverlappingSlotAsync(
        int profileId,
        AvailabilityUpsertDto dto,
        int? excludedAvailabilityId)
    {
        var matchingSchedule = _context.Availabilities.Where(availability =>
            availability.ProfessionalProfileId == profileId
            && (dto.SpecificDate.HasValue
                ? availability.SpecificDate == dto.SpecificDate
                : availability.SpecificDate == null && availability.DayOfWeek == dto.DayOfWeek)
            && availability.IsAvailable);

        if (excludedAvailabilityId.HasValue)
        {
            matchingSchedule = matchingSchedule.Where(
                availability => availability.Id != excludedAvailabilityId.Value);
        }

        return await matchingSchedule.AnyAsync(availability =>
            dto.StartTime < availability.EndTime && dto.EndTime > availability.StartTime);
    }

    private static string? ValidateSchedule(AvailabilityUpsertDto dto)
    {
        if (dto.SpecificDate.HasValue == dto.DayOfWeek.HasValue)
        {
            return "Provide either a specific date or a day of week, but not both.";
        }

        if (dto.DayOfWeek.HasValue && !Enum.IsDefined(dto.DayOfWeek.Value))
        {
            return "Day of week is invalid.";
        }

        if (dto.StartTime >= dto.EndTime)
        {
            return "End time must be later than start time.";
        }

        return null;
    }

    private static AvailabilityDto ToDto(Availability availability) => new()
    {
        Id = availability.Id,
        DayOfWeek = availability.DayOfWeek,
        SpecificDate = availability.SpecificDate,
        StartTime = availability.StartTime,
        EndTime = availability.EndTime,
        IsAvailable = availability.IsAvailable
    };
}
