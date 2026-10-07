using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IAdminService
{
    Task<List<PendingProfessionalVerificationDto>> GetPendingVerificationsAsync();
    Task<(PendingProfessionalVerificationDto? Profile, string? Error)> ApproveProfessionalAsync(int profileId);
    Task<(PendingProfessionalVerificationDto? Profile, string? Error)> RejectProfessionalAsync(int profileId);
    Task<List<AdminDisputeDto>> GetOpenDisputesAsync();
    Task<(AdminDisputeDto? Dispute, string? Error)> ResolveDisputeAsync(
        int disputeId,
        ResolveDisputeDto dto);
    Task<PlatformAnalyticsDto> GetAnalyticsAsync();
}
