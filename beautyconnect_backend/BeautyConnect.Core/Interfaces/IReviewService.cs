using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IReviewService
{
    Task<(ReviewDto? Review, string? Error)> CreateReviewAsync(int userId, ReviewCreateDto dto);
    Task<(List<ReviewDto>? Reviews, string? Error)> GetReviewsForProfessionalAsync(int professionalProfileId);
}
