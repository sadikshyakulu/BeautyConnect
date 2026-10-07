using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var (review, error) = await _reviewService.CreateReviewAsync(userId.Value, dto);
        if (review == null)
        {
            return error == "Customer profile not found."
                ? NotFound(new { message = error })
                : Conflict(new { message = error });
        }

        return CreatedAtAction(
            nameof(GetReviewsForProfessional),
            new { professionalProfileId = review.ProfessionalProfileId },
            review);
    }

    [AllowAnonymous]
    [HttpGet("professionals/{professionalProfileId:int}")]
    public async Task<IActionResult> GetReviewsForProfessional(int professionalProfileId)
    {
        var (reviews, error) = await _reviewService.GetReviewsForProfessionalAsync(professionalProfileId);
        return reviews == null
            ? NotFound(new { message = error })
            : Ok(reviews);
    }

    private int? GetUserId()
    {
        return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            ? userId
            : null;
    }
}
