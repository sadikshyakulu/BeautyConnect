using System.Data;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BeautyConnect.Infrastructure.Services;

public class BookingService : IBookingService
{
    private readonly BeautyConnectDbContext _context;
    private readonly ILogger<BookingService> _logger;

    public BookingService(BeautyConnectDbContext context, ILogger<BookingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<(BookingDto? Booking, string? Error)> CreateBookingAsync(
        int userId,
        BookingCreateDto dto)
    {
        var customerProfile = await _context.CustomerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile => profile.UserId == userId);
        if (customerProfile == null)
        {
            return (null, "Customer profile not found.");
        }

        var service = await _context.Services
            .AsNoTracking()
            .Include(item => item.ProfessionalProfile)
            .FirstOrDefaultAsync(item => item.Id == dto.ServiceId);
        if (service == null)
        {
            return (null, "Service not found.");
        }

        _logger.LogInformation(
            "Loaded booking service {ServiceId} ({ServiceName}) with DurationMinutes={DurationMinutes} ({DurationType})",
            service.Id,
            service.Name,
            service.DurationMinutes,
            service.DurationMinutes.GetType().Name);

        _logger.LogInformation(
            "Preparing booking for service {ServiceId}: scheduledDateTime={RequestedStart:O}, requestedStartUtc={RequestedStartUtc:O}, durationMinutes={DurationMinutes}",
            service.Id,
            dto.ScheduledDateTime,
            dto.ScheduledDateTime.UtcDateTime,
            service.DurationMinutes);
        Console.WriteLine(
            $"BOOKING DEBUG | ServiceId={service.Id} | ServiceName={service.Name} | " +
            $"DurationMinutes={service.DurationMinutes} | " +
            $"DurationMinutesType={service.DurationMinutes.GetType().Name}");

        if (!BookingScheduleValidator.TryPrepare(
                dto.ScheduledDateTime,
                service.DurationMinutes,
                DateTimeOffset.UtcNow,
                out var schedule,
                out var scheduleError,
                _logger))
        {
            return (null, scheduleError);
        }

        var scheduledDate = DateOnly.FromDateTime(schedule.LocalStart);
        var strategy = _context.Database.CreateExecutionStrategy();
        var (bookingId, error) = await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

            var matchingAvailabilitySlots = await _context.Availabilities
                .Where(availability =>
                    availability.ProfessionalProfileId == service.ProfessionalProfileId
                    && (availability.SpecificDate == scheduledDate
                    || (availability.SpecificDate == null
                        && availability.DayOfWeek == scheduledDate.DayOfWeek)))
                .ToListAsync();
            var isWithinAvailability = BookingScheduleValidator.FitsAvailabilitySlot(
                matchingAvailabilitySlots,
                schedule);
            if (!isWithinAvailability)
            {
                await transaction.RollbackAsync();
                return (BookingId: (int?)null, Error: "The requested time is not within an available slot.");
            }

            var hasConflict = await _context.Bookings.AnyAsync(booking =>
                booking.ProfessionalProfileId == service.ProfessionalProfileId
                && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed)
                && booking.ScheduledDateTime < schedule.LocalEnd
                && booking.EndDateTime > schedule.LocalStart);
            if (hasConflict)
            {
                await transaction.RollbackAsync();
                return (BookingId: (int?)null, Error: "The requested time conflicts with another booking.");
            }

            var booking = new Booking
            {
                CustomerProfileId = customerProfile.Id,
                ProfessionalProfileId = service.ProfessionalProfileId,
                ServiceId = service.Id,
                ScheduledDateTime = schedule.LocalStart,
                EndDateTime = schedule.LocalEnd,
                Status = BookingStatus.Pending,
                TotalPrice = service.Price,
                Notes = dto.Notes?.Trim()
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return (BookingId: (int?)booking.Id, Error: (string?)null);
        });

        if (bookingId == null)
        {
            return (null, error);
        }

        var createdBooking = await GetBookingDtoAsync(bookingId.Value);
        return (createdBooking, null);
    }

    public async Task<List<BookingDto>?> GetCustomerBookingsAsync(int userId)
    {
        var profileId = await _context.CustomerProfiles
            .Where(profile => profile.UserId == userId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync();
        if (profileId == null)
        {
            return null;
        }

        var bookings = await GetBookingDtosQuery()
            .Where(booking => booking.CustomerProfileId == profileId.Value)
            .OrderByDescending(booking => booking.ScheduledDateTime)
            .ToListAsync();
        return bookings.Select(ToDto).ToList();
    }

    public async Task<List<BookingDto>?> GetProfessionalBookingsAsync(int userId)
    {
        var profileId = await _context.ProfessionalProfiles
            .Where(profile => profile.UserId == userId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync();
        if (profileId == null)
        {
            return null;
        }

        var bookings = await GetBookingDtosQuery()
            .Where(booking => booking.ProfessionalProfileId == profileId.Value)
            .OrderBy(booking => booking.ScheduledDateTime)
            .ToListAsync();
        return bookings.Select(ToDto).ToList();
    }

    public Task<(BookingDto? Booking, string? Error)> AcceptBookingAsync(int userId, int bookingId)
    {
        return ChangeStatusAsync(
            userId,
            bookingId,
            BookingStatus.Pending,
            BookingStatus.Confirmed,
            professional: true);
    }

    public Task<(BookingDto? Booking, string? Error)> RejectBookingAsync(int userId, int bookingId)
    {
        return ChangeStatusAsync(
            userId,
            bookingId,
            BookingStatus.Pending,
            BookingStatus.Cancelled,
            professional: true);
    }

    public Task<(BookingDto? Booking, string? Error)> CompleteBookingAsync(int userId, int bookingId)
    {
        return ChangeStatusAsync(
            userId,
            bookingId,
            BookingStatus.Confirmed,
            BookingStatus.Completed,
            professional: true);
    }

    public Task<(BookingDto? Booking, string? Error)> CancelBookingAsync(int userId, int bookingId)
    {
        return ChangeStatusAsync(
            userId,
            bookingId,
            null,
            BookingStatus.Cancelled,
            professional: false);
    }

    private async Task<(BookingDto? Booking, string? Error)> ChangeStatusAsync(
        int userId,
        int bookingId,
        BookingStatus? expectedStatus,
        BookingStatus targetStatus,
        bool professional)
    {
        IQueryable<Booking> query = _context.Bookings
            .Include(booking => booking.CustomerProfile)
                .ThenInclude(customer => customer.User)
            .Include(booking => booking.ProfessionalProfile)
            .Include(booking => booking.Service);
        query = professional
            ? query.Where(booking => booking.ProfessionalProfile.UserId == userId)
            : query.Where(booking => booking.CustomerProfile.UserId == userId);

        var booking = await query.FirstOrDefaultAsync(item => item.Id == bookingId);
        if (booking == null)
        {
            return (null, "Booking not found.");
        }

        var canCancel = !professional
            && targetStatus == BookingStatus.Cancelled
            && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed);
        if (expectedStatus.HasValue
            ? booking.Status != expectedStatus.Value
            : !canCancel)
        {
            return (null, $"Booking cannot transition from {booking.Status} to {targetStatus}.");
        }

        booking.Status = targetStatus;
        await _context.SaveChangesAsync();
        return (ToDto(booking), null);
    }

    private async Task<BookingDto?> GetBookingDtoAsync(int bookingId)
    {
        var booking = await GetBookingDtosQuery()
            .Where(booking => booking.Id == bookingId)
            .FirstOrDefaultAsync();
        return booking == null ? null : ToDto(booking);
    }

    private IQueryable<Booking> GetBookingDtosQuery()
    {
        return _context.Bookings
            .AsNoTracking()
            .Include(booking => booking.CustomerProfile)
                .ThenInclude(customer => customer.User)
            .Include(booking => booking.ProfessionalProfile)
            .Include(booking => booking.Service);
    }

    private static BookingDto ToDto(Booking booking) => new()
    {
        Id = booking.Id,
        CustomerProfileId = booking.CustomerProfileId,
        ProfessionalProfileId = booking.ProfessionalProfileId,
        ServiceId = booking.ServiceId,
        ScheduledDateTime = BookingScheduleValidator.ToNepalDateTimeOffset(booking.ScheduledDateTime),
        EndDateTime = BookingScheduleValidator.ToNepalDateTimeOffset(booking.EndDateTime),
        Status = booking.Status,
        TotalPrice = booking.TotalPrice,
        CommissionAmount = booking.CommissionAmount,
        Notes = booking.Notes,
        CreatedAt = booking.CreatedAt,
        CustomerName = booking.CustomerProfile.FullName,
        CustomerEmail = booking.CustomerProfile.User.Email,
        ProfessionalBusinessName = booking.ProfessionalProfile.BusinessName,
        Service = new ServiceDto
        {
            Id = booking.Service.Id,
            ProfessionalProfileId = booking.Service.ProfessionalProfileId,
            Name = booking.Service.Name,
            Description = booking.Service.Description,
            Category = booking.Service.Category,
            Price = booking.Service.Price,
            DurationMinutes = booking.Service.DurationMinutes
        }
    };
}
