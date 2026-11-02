using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Professional")]
public sealed class PayoutController : ControllerBase
{
    private readonly IPayoutService _payoutService;

    public PayoutController(IPayoutService payoutService)
    {
        _payoutService = payoutService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _payoutService.GetEarningsSummaryAsync(userId.Value);
        return ToActionResult(result);
    }

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var requests = await _payoutService.GetMyRequestsAsync(userId.Value);
        return requests == null
            ? NotFound(new { message = "Professional profile not found." })
            : Ok(requests);
    }

    [HttpPost("request")]
    public async Task<IActionResult> RequestPayout()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        return ToActionResult(await _payoutService.RequestPayoutAsync(userId.Value));
    }

    private int? GetUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;

    private IActionResult ToActionResult<T>(PayoutOperationResult<T> result)
    {
        if (result.Value != null) return Ok(result.Value);
        return result.ErrorCode switch
        {
            PayoutErrorCode.InvalidRequest => BadRequest(new { message = result.Error }),
            PayoutErrorCode.NotFound => NotFound(new { message = result.Error }),
            PayoutErrorCode.Conflict => Conflict(new { message = result.Error }),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
}
