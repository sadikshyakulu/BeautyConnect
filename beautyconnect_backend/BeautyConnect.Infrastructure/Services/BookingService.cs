using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public class BookingService : IBookingService
{
    private readonly BeautyConnectDbContext _context;

    public BookingService(BeautyConnectDbContext context)
    {
        _context = context;
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
        return CancelBookingForCustomerAsync(userId, bookingId);
    }

    private async Task<(BookingDto? Booking, string? Error)> CancelBookingForCustomerAsync(
        int userId,
        int bookingId)
    {
        var booking = await _context.Bookings
            .Include(item => item.CustomerProfile)
                .ThenInclude(customer => customer.User)
            .Include(item => item.ProfessionalProfile)
            .Include(item => item.Service)
            .FirstOrDefaultAsync(
                item => item.Id == bookingId && item.CustomerProfile.UserId == userId);
        if (booking == null)
        {
            return (null, "Booking not found.");
        }

        if (booking.Status is not (BookingStatus.Pending or BookingStatus.Confirmed))
        {
            return (null, $"Booking cannot be cancelled from status {booking.Status}.");
        }

        booking.Status = BookingStatus.Cancelled;
        if (!string.IsNullOrWhiteSpace(booking.EsewaTransactionUuid)
            && !string.IsNullOrWhiteSpace(booking.EsewaTransactionCode)
            && booking.EsewaTotalAmount.HasValue)
        {
            booking.RefundStatus = RefundStatus.Requested;
            booking.RefundAmount = booking.EsewaTotalAmount.Value;
            booking.RefundRequestedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return (ToDto(booking), null);
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
        RefundAmount = booking.RefundAmount,
        RefundStatus = booking.RefundStatus,
        RefundRequestedAt = booking.RefundRequestedAt,
        RefundedAt = booking.RefundedAt,
        RefundGatewayReference = booking.RefundGatewayReference,
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
