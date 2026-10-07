using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IBookingService
{
    Task<List<BookingDto>?> GetCustomerBookingsAsync(int userId);
    Task<List<BookingDto>?> GetProfessionalBookingsAsync(int userId);
    Task<(BookingDto? Booking, string? Error)> AcceptBookingAsync(int userId, int bookingId);
    Task<(BookingDto? Booking, string? Error)> RejectBookingAsync(int userId, int bookingId);
    Task<(BookingDto? Booking, string? Error)> CompleteBookingAsync(int userId, int bookingId);
    Task<(BookingDto? Booking, string? Error)> CancelBookingAsync(int userId, int bookingId);
}
