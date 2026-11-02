using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IPayoutService _payoutService;

    public AdminController(IAdminService adminService, IPayoutService payoutService)
    {
        _adminService = adminService;
        _payoutService = payoutService;
    }

    [HttpGet("verifications/pending")]
    public async Task<IActionResult> GetPendingVerifications()
    {
        return Ok(await _adminService.GetPendingVerificationsAsync());
    }

    [HttpPost("verifications/{profileId:int}/approve")]
    public Task<IActionResult> ApproveProfessional(int profileId)
    {
        return UpdateVerificationAsync(
            () => _adminService.ApproveProfessionalAsync(profileId));
    }

    [HttpPost("verifications/{profileId:int}/reject")]
    public Task<IActionResult> RejectProfessional(int profileId)
    {
        return UpdateVerificationAsync(
            () => _adminService.RejectProfessionalAsync(profileId));
    }

    [HttpGet("disputes/open")]
    public async Task<IActionResult> GetOpenDisputes()
    {
        return Ok(await _adminService.GetOpenDisputesAsync());
    }

    [HttpPost("disputes/{disputeId:int}/resolve")]
    public async Task<IActionResult> ResolveDispute(
        int disputeId,
        [FromBody] ResolveDisputeDto dto)
    {
        var (dispute, error) = await _adminService.ResolveDisputeAsync(disputeId, dto);
        if (dispute == null)
        {
            return error == "Dispute not found."
                ? NotFound(new { message = error })
                : Conflict(new { message = error });
        }

        return Ok(dispute);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        return Ok(await _adminService.GetAnalyticsAsync());
    }

    [HttpGet("recent-activity")]
    public async Task<IActionResult> GetRecentActivity()
    {
        return Ok(await _adminService.GetRecentActivityAsync());
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        return Ok(await _adminService.GetCustomersAsync());
    }

    [HttpGet("professionals")]
    public async Task<IActionResult> GetProfessionals()
    {
        return Ok(await _adminService.GetProfessionalsAsync());
    }

    [HttpGet("payouts/queue")]
    public async Task<IActionResult> GetPayoutQueue()
    {
        return Ok(await _payoutService.ListQueueAsync());
    }

    [HttpGet("payouts/history")]
    public async Task<IActionResult> GetPayoutHistory()
    {
        return Ok(await _payoutService.ListHistoryAsync());
    }

    [HttpGet("payouts/balances")]
    public async Task<IActionResult> GetProfessionalPayoutBalances()
    {
        return Ok(await _payoutService.ListProfessionalBalancesAsync());
    }

    [HttpPost("payouts/{id:int}/mark-paid")]
    public async Task<IActionResult> MarkPayoutPaid(int id, [FromBody] MarkPayoutPaidDto request)
    {
        var adminUserId = GetUserId();
        if (adminUserId == null) return Unauthorized();
        var result = await _payoutService.MarkPaidAsync(id, adminUserId.Value, request);
        return ToPayoutActionResult(result);
    }

    [HttpPost("payouts/{id:int}/reject")]
    public async Task<IActionResult> RejectPayout(int id, [FromBody] RejectPayoutDto request)
    {
        var adminUserId = GetUserId();
        if (adminUserId == null) return Unauthorized();
        var result = await _payoutService.RejectAsync(id, adminUserId.Value, request);
        return ToPayoutActionResult(result);
    }

    private IActionResult ToPayoutActionResult<T>(PayoutOperationResult<T> result)
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

    private int? GetUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;

    private async Task<IActionResult> UpdateVerificationAsync(
        Func<Task<(PendingProfessionalVerificationDto? Profile, string? Error)>> update)
    {
        var (profile, error) = await update();
        if (profile == null)
        {
            return error == "Professional profile not found."
                ? NotFound(new { message = error })
                : Conflict(new { message = error });
        }

        return Ok(profile);
    }
}
