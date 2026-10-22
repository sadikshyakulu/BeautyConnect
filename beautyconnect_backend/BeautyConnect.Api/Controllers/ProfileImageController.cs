using System.Security.Claims;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer,Professional")]
public sealed class ProfileImageController : ControllerBase
{
    private readonly IProfileImageService _profileImageService;

    public ProfileImageController(IProfileImageService profileImageService)
    {
        _profileImageService = profileImageService;
    }

    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadAvatar(IFormFile? image)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        if (image == null)
        {
            return BadRequest(new { message = "A profile image file is required." });
        }

        await using var stream = image.OpenReadStream();
        var (result, error) = await _profileImageService.UploadAvatarAsync(
            userId,
            stream,
            image.ContentType,
            image.Length);

        if (result == null)
        {
            return error == "Profile not found."
                ? NotFound(new { message = error })
                : BadRequest(new { message = error });
        }

        return Ok(result);
    }
}
