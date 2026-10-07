using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;

    public AvailabilityController(IAvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    [Authorize(Roles = "Professional")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyAvailability()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var availability = await _availabilityService.GetMyAvailabilityAsync(userId.Value);
        return availability == null
            ? NotFound(new { message = "Professional profile not found." })
            : Ok(availability);
    }

    [Authorize(Roles = "Professional")]
    [HttpPost]
    public async Task<IActionResult> CreateAvailability([FromBody] AvailabilityUpsertDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (availability, error) = await _availabilityService.CreateAsync(userId.Value, dto);
        if (availability == null)
        {
            return error == "Professional profile not found."
                ? NotFound(new { message = error })
                : BadRequest(new { message = error });
        }

        return CreatedAtAction(nameof(GetMyAvailability), availability);
    }

    [Authorize(Roles = "Professional")]
    [HttpPut("{availabilityId:int}")]
    public async Task<IActionResult> UpdateAvailability(
        int availabilityId,
        [FromBody] AvailabilityUpsertDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (availability, error) = await _availabilityService.UpdateAsync(
            userId.Value,
            availabilityId,
            dto);
        if (availability == null)
        {
            return error == "Availability slot not found."
                ? NotFound(new { message = error })
                : BadRequest(new { message = error });
        }

        return Ok(availability);
    }

    [AllowAnonymous]
    [HttpGet("professionals/{professionalProfileId:int}/open-slots")]
    public async Task<IActionResult> GetOpenSlots(
        int professionalProfileId,
        [FromQuery, Required] DateOnly? date)
    {
        if (date == null)
        {
            return BadRequest(new { message = "A date query parameter is required (YYYY-MM-DD)." });
        }

        var (slots, error) = await _availabilityService.GetOpenSlotsAsync(
            professionalProfileId,
            date.Value);
        if (slots == null)
        {
            return NotFound(new { message = error });
        }

        return Ok(slots);
    }

    private int? GetUserId()
    {
        return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;
    }
}
