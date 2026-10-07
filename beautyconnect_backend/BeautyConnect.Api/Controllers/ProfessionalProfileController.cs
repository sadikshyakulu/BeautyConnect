using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Professional")]
public class ProfessionalProfileController : ControllerBase
{
    private readonly IProfessionalProfileService _profileService;

    public ProfessionalProfileController(IProfessionalProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _profileService.GetProfileAsync(userId.Value);
        return profile == null ? NotFound() : Ok(profile);
    }

    [AllowAnonymous]
    [HttpGet("{profileId:int}")]
    public async Task<IActionResult> GetProfileById(int profileId)
    {
        var profile = await _profileService.GetProfileByIdAsync(profileId);
        if (profile == null)
        {
            return NotFound();
        }

        var isOwner = GetUserId() == profile.UserId;
        if (profile.VerificationStatus != BeautyConnect.Core.Enums.VerificationStatus.Approved
            && !User.IsInRole("Admin")
            && !isOwner)
        {
            return NotFound();
        }

        return Ok(profile);
    }

    [HttpPut("me")]
    public async Task<IActionResult> SaveMyProfile([FromBody] ProfessionalProfileUpdateDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _profileService.SaveProfileAsync(userId.Value, dto);
        return Ok(profile);
    }

    [HttpPost("services")]
    public async Task<IActionResult> AddService([FromBody] ServiceUpsertDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var service = await _profileService.AddServiceAsync(userId.Value, dto);
        return service == null ? NotFound(new { message = "Professional profile not found." }) : Ok(service);
    }

    [HttpPut("services/{serviceId:int}")]
    public async Task<IActionResult> UpdateService(int serviceId, [FromBody] ServiceUpsertDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var service = await _profileService.UpdateServiceAsync(userId.Value, serviceId, dto);
        return service == null ? NotFound(new { message = "Service not found." }) : Ok(service);
    }

    [HttpPost("portfolio/images")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadPortfolioImage(IFormFile? image)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        if (image == null) return BadRequest(new { message = "An image file is required." });

        await using var stream = image.OpenReadStream();
        var result = await _profileService.AddPortfolioImageAsync(
            userId.Value,
            stream,
            image.ContentType,
            image.Length);

        if (result == null) return NotFound(new { message = "Professional profile not found." });
        if (result.Error != null) return BadRequest(new { message = result.Error });
        return Ok(result);
    }

    [HttpPost("submit-verification")]
    public async Task<IActionResult> SubmitForVerification()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var submitted = await _profileService.SubmitForVerificationAsync(userId.Value);
        return submitted
            ? Ok(new { message = "Professional profile submitted for verification." })
            : NotFound(new { message = "Professional profile not found." });
    }

    private int? GetUserId()
    {
        return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;
    }
}
