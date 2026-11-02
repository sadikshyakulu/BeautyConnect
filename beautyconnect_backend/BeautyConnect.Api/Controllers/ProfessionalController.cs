using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Professional")]
public sealed class ProfessionalController : ControllerBase
{
    private readonly IPayoutService _payoutService;

    public ProfessionalController(IPayoutService payoutService)
    {
        _payoutService = payoutService;
    }

    [HttpGet("payout-details")]
    public async Task<IActionResult> GetPayoutDetails()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var details = await _payoutService.GetPayoutDetailsAsync(userId.Value);
        return details == null
            ? NotFound(new { message = "Professional profile not found." })
            : Ok(details);
    }

    [HttpPut("payout-details")]
    public async Task<IActionResult> UpdatePayoutDetails([FromBody] PayoutDetailsUpdateDto request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _payoutService.UpdatePayoutDetailsAsync(userId.Value, request);
        if (result.Value != null) return Ok(result.Value);
        return result.ErrorCode switch
        {
            PayoutErrorCode.InvalidRequest => BadRequest(new { message = result.Error }),
            PayoutErrorCode.NotFound => NotFound(new { message = result.Error }),
            PayoutErrorCode.Conflict => Conflict(new { message = result.Error }),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    private int? GetUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;
}
