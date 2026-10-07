using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public class AdminService : IAdminService
{
    private static readonly TimeSpan ActiveUserWindow = TimeSpan.FromDays(30);
    private readonly BeautyConnectDbContext _context;

    public AdminService(BeautyConnectDbContext context)
    {
        _context = context;
    }

    public async Task<List<PendingProfessionalVerificationDto>> GetPendingVerificationsAsync()
    {
        var profiles = await _context.ProfessionalProfiles
            .AsNoTracking()
            .Where(profile => profile.VerificationStatus == VerificationStatus.Pending)
            .Include(profile => profile.User)
            .OrderBy(profile => profile.Id)
            .ToListAsync();

        return profiles.Select(ToDto).ToList();
    }

    public async Task<(PendingProfessionalVerificationDto? Profile, string? Error)> ApproveProfessionalAsync(
        int profileId)
    {
        return await UpdateVerificationStatusAsync(profileId, VerificationStatus.Approved);
    }

    public async Task<(PendingProfessionalVerificationDto? Profile, string? Error)> RejectProfessionalAsync(
        int profileId)
    {
        return await UpdateVerificationStatusAsync(profileId, VerificationStatus.Rejected);
    }

    public async Task<List<AdminDisputeDto>> GetOpenDisputesAsync()
    {
        var disputes = await GetDisputesQuery()
            .Where(dispute => dispute.Status == DisputeStatus.Open
                || dispute.Status == DisputeStatus.UnderReview)
            .OrderBy(dispute => dispute.CreatedAt)
            .ToListAsync();

        return disputes.Select(ToDto).ToList();
    }

    public async Task<(AdminDisputeDto? Dispute, string? Error)> ResolveDisputeAsync(
        int disputeId,
        ResolveDisputeDto dto)
    {
        var dispute = await GetDisputesQuery()
            .FirstOrDefaultAsync(item => item.Id == disputeId);
        if (dispute == null)
        {
            return (null, "Dispute not found.");
        }

        if (dispute.Status != DisputeStatus.Open
            && dispute.Status != DisputeStatus.UnderReview)
        {
            return (null, $"Dispute cannot be resolved from status {dispute.Status}.");
        }

        dispute.Status = DisputeStatus.Resolved;
        dispute.ResolutionNotes = dto.ResolutionNotes.Trim();
        await _context.SaveChangesAsync();

        return (ToDto(dispute), null);
    }

    public async Task<PlatformAnalyticsDto> GetAnalyticsAsync()
    {
        var activeUsersSinceUtc = DateTime.UtcNow.Subtract(ActiveUserWindow);
        var totalBookings = await _context.Bookings.CountAsync();
        var revenue = await _context.Bookings
            .Where(booking => booking.Status == BookingStatus.Completed)
            .SumAsync(booking => (decimal?)booking.TotalPrice) ?? 0m;
        var customerUserIds = _context.Bookings
            .Where(booking => booking.CreatedAt >= activeUsersSinceUtc)
            .Select(booking => booking.CustomerProfile.UserId);
        var professionalUserIds = _context.Bookings
            .Where(booking => booking.CreatedAt >= activeUsersSinceUtc)
            .Select(booking => booking.ProfessionalProfile.UserId);
        var activeUsers = await customerUserIds
            .Union(professionalUserIds)
            .Distinct()
            .CountAsync();
        var verifiedProfessionalCount = await _context.ProfessionalProfiles
            .CountAsync(profile => profile.VerificationStatus == VerificationStatus.Approved);

        return new PlatformAnalyticsDto
        {
            TotalBookings = totalBookings,
            Revenue = revenue,
            ActiveUsers = activeUsers,
            VerifiedProfessionalCount = verifiedProfessionalCount,
            ActiveUsersSinceUtc = activeUsersSinceUtc
        };
    }

    private async Task<(PendingProfessionalVerificationDto? Profile, string? Error)>
        UpdateVerificationStatusAsync(int profileId, VerificationStatus targetStatus)
    {
        var profile = await _context.ProfessionalProfiles
            .Include(item => item.User)
            .FirstOrDefaultAsync(item => item.Id == profileId);
        if (profile == null)
        {
            return (null, "Professional profile not found.");
        }

        if (profile.VerificationStatus != VerificationStatus.Pending)
        {
            return (null, $"Professional profile cannot be reviewed from status {profile.VerificationStatus}.");
        }

        profile.VerificationStatus = targetStatus;
        await _context.SaveChangesAsync();
        return (ToDto(profile), null);
    }

    private IQueryable<Dispute> GetDisputesQuery()
    {
        return _context.Disputes
            .Include(dispute => dispute.RaisedByUser)
            .Include(dispute => dispute.Booking);
    }

    private static PendingProfessionalVerificationDto ToDto(ProfessionalProfile profile) => new()
    {
        Id = profile.Id,
        UserId = profile.UserId,
        Email = profile.User.Email,
        BusinessName = profile.BusinessName,
        Bio = profile.Bio,
        Speciality = profile.Speciality,
        City = profile.City,
        Address = profile.Address,
        AvatarUrl = profile.AvatarUrl,
        VerificationStatus = profile.VerificationStatus
    };

    private static AdminDisputeDto ToDto(Dispute dispute) => new()
    {
        Id = dispute.Id,
        BookingId = dispute.BookingId,
        RaisedByUserId = dispute.RaisedByUserId,
        RaisedByEmail = dispute.RaisedByUser.Email,
        Reason = dispute.Reason,
        Status = dispute.Status,
        ResolutionNotes = dispute.ResolutionNotes,
        CreatedAt = dispute.CreatedAt,
        BookingScheduledDateTime = dispute.Booking.ScheduledDateTime,
        BookingTotalPrice = dispute.Booking.TotalPrice
    };
}
