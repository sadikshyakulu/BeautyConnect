using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] BookingCreateDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (booking, error) = await _bookingService.CreateBookingAsync(userId.Value, dto);
        if (booking == null)
        {
            if (error?.EndsWith("not found.", StringComparison.OrdinalIgnoreCase) == true)
            {
                return NotFound(new { message = error });
            }

            if (error?.Contains("conflict", StringComparison.OrdinalIgnoreCase) == true)
            {
                return Conflict(new { message = error });
            }

            return BadRequest(new { message = error });
        }

        return CreatedAtAction(nameof(GetCustomerBookings), null, booking);
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("customer")]
    public async Task<IActionResult> GetCustomerBookings()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var bookings = await _bookingService.GetCustomerBookingsAsync(userId.Value);
        return bookings == null
            ? NotFound(new { message = "Customer profile not found." })
            : Ok(bookings);
    }

    [Authorize(Roles = "Professional")]
    [HttpGet("professional/incoming")]
    public async Task<IActionResult> GetProfessionalBookings()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var bookings = await _bookingService.GetProfessionalBookingsAsync(userId.Value);
        return bookings == null
            ? NotFound(new { message = "Professional profile not found." })
            : Ok(bookings);
    }

    [Authorize(Roles = "Professional")]
    [HttpPost("{bookingId:int}/accept")]
    public Task<IActionResult> AcceptBooking(int bookingId)
    {
        return ChangeBookingStatusAsync(
            userId => _bookingService.AcceptBookingAsync(userId, bookingId));
    }

    [Authorize(Roles = "Professional")]
    [HttpPost("{bookingId:int}/reject")]
    public Task<IActionResult> RejectBooking(int bookingId)
    {
        return ChangeBookingStatusAsync(
            userId => _bookingService.RejectBookingAsync(userId, bookingId));
    }

    [Authorize(Roles = "Professional")]
    [HttpPost("{bookingId:int}/complete")]
    public Task<IActionResult> CompleteBooking(int bookingId)
    {
        return ChangeBookingStatusAsync(
            userId => _bookingService.CompleteBookingAsync(userId, bookingId));
    }

    [Authorize(Roles = "Customer")]
    [HttpPost("{bookingId:int}/cancel")]
    public Task<IActionResult> CancelBooking(int bookingId)
    {
        return ChangeBookingStatusAsync(
            userId => _bookingService.CancelBookingAsync(userId, bookingId));
    }

    private async Task<IActionResult> ChangeBookingStatusAsync(
        Func<int, Task<(BookingDto? Booking, string? Error)>> changeStatus)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (booking, error) = await changeStatus(userId.Value);
        if (booking == null)
        {
            return error == "Booking not found."
                ? NotFound(new { message = error })
                : Conflict(new { message = error });
        }

        return Ok(booking);
    }

    private int? GetUserId()
    {
        return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;
    }
}
