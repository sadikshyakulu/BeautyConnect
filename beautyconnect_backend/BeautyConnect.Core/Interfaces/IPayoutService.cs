using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IPayoutService
{
    Task<PayoutDetailsDto?> GetPayoutDetailsAsync(int professionalUserId);
    Task<PayoutOperationResult<PayoutDetailsDto>> UpdatePayoutDetailsAsync(
        int professionalUserId,
        PayoutDetailsUpdateDto request);
    Task<PayoutOperationResult<PayoutEarningsSummaryDto>> GetEarningsSummaryAsync(int professionalUserId);
    Task<PayoutOperationResult<PayoutRequestSummaryDto>> RequestPayoutAsync(int professionalUserId);
    Task<List<PayoutRequestSummaryDto>?> GetMyRequestsAsync(int professionalUserId);
    Task<List<AdminPayoutRequestDto>> ListQueueAsync();
    Task<List<AdminPayoutRequestDto>> ListHistoryAsync();
    Task<List<AdminProfessionalPayoutBalanceDto>> ListProfessionalBalancesAsync();
    Task<PayoutOperationResult<AdminPayoutRequestDto>> MarkPaidAsync(
        int requestId,
        int adminUserId,
        MarkPayoutPaidDto request);
    Task<PayoutOperationResult<AdminPayoutRequestDto>> RejectAsync(
        int requestId,
        int adminUserId,
        RejectPayoutDto request);
}
