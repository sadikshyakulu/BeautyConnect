using System.Data;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly BeautyConnectDbContext _context;

    public ReviewService(BeautyConnectDbContext context)
    {
        _context = context;
    }

    public async Task<(ReviewDto? Review, string? Error)> CreateReviewAsync(
        int userId,
        ReviewCreateDto dto)
    {
        var customerProfileId = await _context.CustomerProfiles
            .Where(profile => profile.UserId == userId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync();
        if (customerProfileId == null)
        {
            return (null, "Customer profile not found.");
        }

        var strategy = _context.Database.CreateExecutionStrategy();
        var result = await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

            var booking = await _context.Bookings
                .Include(item => item.ProfessionalProfile)
                .FirstOrDefaultAsync(item =>
                    item.Id == dto.BookingId && item.CustomerProfileId == customerProfileId.Value);
            if (booking == null)
            {
                await transaction.RollbackAsync();
                return (Review: (ReviewDto?)null, Error: "Completed booking not found for this customer.");
            }

            if (booking.Status != BookingStatus.Completed)
            {
                await transaction.RollbackAsync();
                return (Review: (ReviewDto?)null, Error: "Only completed bookings can be reviewed.");
            }

            if (await _context.Reviews.AnyAsync(review => review.BookingId == booking.Id))
            {
                await transaction.RollbackAsync();
                return (Review: (ReviewDto?)null, Error: "This booking has already been reviewed.");
            }

            var review = new Core.Entities.Review
            {
                BookingId = booking.Id,
                CustomerProfileId = customerProfileId.Value,
                ProfessionalProfileId = booking.ProfessionalProfileId,
                Rating = dto.Rating,
                Comment = dto.Comment.Trim()
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var totalReviews = await _context.Reviews
                .CountAsync(item => item.ProfessionalProfileId == booking.ProfessionalProfileId);
            var ratingAverage = await _context.Reviews
                .Where(item => item.ProfessionalProfileId == booking.ProfessionalProfileId)
                .AverageAsync(item => (double?)item.Rating);

            booking.ProfessionalProfile.TotalReviews = totalReviews;
            booking.ProfessionalProfile.RatingAverage = ratingAverage ?? 0;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var createdReview = await _context.Reviews
                .AsNoTracking()
                .Include(item => item.CustomerProfile)
                .Include(item => item.Booking)
                    .ThenInclude(item => item.Service)
                .FirstAsync(item => item.Id == review.Id);

            return (Review: ToDto(createdReview), Error: (string?)null);
        });

        return result;
    }

    public async Task<(List<ReviewDto>? Reviews, string? Error)> GetReviewsForProfessionalAsync(
        int professionalProfileId)
    {
        var profileExists = await _context.ProfessionalProfiles
            .AnyAsync(profile => profile.Id == professionalProfileId);
        if (!profileExists)
        {
            return (null, "Professional profile not found.");
        }

        var reviews = await _context.Reviews
            .AsNoTracking()
            .Where(review => review.ProfessionalProfileId == professionalProfileId)
            .Include(review => review.CustomerProfile)
            .Include(review => review.Booking)
                .ThenInclude(booking => booking.Service)
            .OrderByDescending(review => review.CreatedAt)
            .ToListAsync();

        return (reviews.Select(ToDto).ToList(), null);
    }

    private static ReviewDto ToDto(Core.Entities.Review review) => new()
    {
        Id = review.Id,
        BookingId = review.BookingId,
        CustomerProfileId = review.CustomerProfileId,
        ProfessionalProfileId = review.ProfessionalProfileId,
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt,
        CustomerName = review.CustomerProfile.FullName,
        ServiceName = review.Booking.Service.Name
    };
}
