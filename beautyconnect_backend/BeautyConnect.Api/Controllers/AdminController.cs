using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
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
