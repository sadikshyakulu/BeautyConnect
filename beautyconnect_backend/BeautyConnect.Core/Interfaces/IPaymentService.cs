using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IPaymentService
{
    Task<PaymentOperationResult<EsewaPaymentFormDto>> InitiatePaymentAsync(
        int userId,
        PaymentInitiateDto request,
        CancellationToken cancellationToken);

    Task<PaymentOperationResult<EsewaPaymentFormDto>> RefreshPaymentAsync(
        int userId,
        string transactionUuid,
        CancellationToken cancellationToken);

    Task<PaymentOperationResult<PaymentStatusDto>> VerifyPaymentCallbackAsync(
        string encodedResponse,
        CancellationToken cancellationToken);

    Task<PaymentOperationResult<PaymentStatusDto>> HandleFailureCallbackAsync(
        string transactionUuid,
        CancellationToken cancellationToken);

    Task<PaymentOperationResult<PaymentStatusDto>> CheckTransactionStatusAsync(
        int userId,
        string transactionUuid,
        CancellationToken cancellationToken);

    Task<PaymentOperationResult<RefundVerificationDto>> VerifyRefundStatusAsync(
        int professionalUserId,
        int bookingId,
        CancellationToken cancellationToken);
}
