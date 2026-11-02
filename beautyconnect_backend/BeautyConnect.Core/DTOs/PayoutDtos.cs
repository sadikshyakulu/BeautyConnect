using System.ComponentModel.DataAnnotations;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.DTOs;

public sealed class PayoutDetailsUpdateDto : IValidatableObject
{
    [Required, StringLength(10, MinimumLength = 4)]
    public string PayoutMethod { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 2)]
    public string AccountName { get; set; } = string.Empty;

    [Required, StringLength(30, MinimumLength = 6)]
    public string AccountNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? BankName { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var method = PayoutMethod.Trim();
        if (!method.Equals("eSewa", StringComparison.OrdinalIgnoreCase)
            && !method.Equals("Bank", StringComparison.OrdinalIgnoreCase))
        {
            yield return new ValidationResult(
                "Payout method must be eSewa or Bank.",
                [nameof(PayoutMethod)]);
            yield break;
        }

        var accountNumber = AccountNumber.Trim();
        if (method.Equals("eSewa", StringComparison.OrdinalIgnoreCase)
            && !System.Text.RegularExpressions.Regex.IsMatch(accountNumber, @"^9[678]\d{8}$"))
        {
            yield return new ValidationResult(
                "Enter a valid 10-digit Nepali mobile number for eSewa.",
                [nameof(AccountNumber)]);
        }
        else if (method.Equals("Bank", StringComparison.OrdinalIgnoreCase)
            && !System.Text.RegularExpressions.Regex.IsMatch(accountNumber, @"^\d{6,30}$"))
        {
            yield return new ValidationResult(
                "Bank account number must contain 6 to 30 digits.",
                [nameof(AccountNumber)]);
        }

        if (method.Equals("Bank", StringComparison.OrdinalIgnoreCase)
            && string.IsNullOrWhiteSpace(BankName))
        {
            yield return new ValidationResult(
                "Bank name is required for bank payouts.",
                [nameof(BankName)]);
        }
    }
}

public sealed record PayoutDetailsDto(
    string? PayoutMethod,
    string? AccountName,
    string? MaskedAccountNumber,
    string? BankName);

public sealed record PayoutEarningsSummaryDto(
    decimal Pending,
    decimal Available,
    decimal Requested,
    decimal PaidOut);

public sealed record PayoutRequestSummaryDto(
    int Id,
    decimal Amount,
    string Status,
    DateTime RequestedAt,
    DateTime? ProcessedAt,
    string PayoutMethod,
    string MaskedAccountNumber,
    string? Reference,
    string? RejectionReason,
    string? Notes);

public sealed record AdminPayoutRequestDto(
    int Id,
    int ProfessionalProfileId,
    string ProfessionalName,
    string ProfessionalEmail,
    string? ProfessionalAvatarUrl,
    decimal Amount,
    string Status,
    DateTime RequestedAt,
    DateTime? ProcessedAt,
    string PayoutMethod,
    string AccountName,
    string AccountNumber,
    string? BankName,
    string? Reference,
    string? RejectionReason,
    string? Notes);

public sealed class MarkPayoutPaidDto
{
    [Required, StringLength(200, MinimumLength = 1)]
    public string Reference { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Notes { get; set; }
}

public sealed class RejectPayoutDto
{
    [Required, StringLength(1000, MinimumLength = 3)]
    public string Reason { get; set; } = string.Empty;
}

public enum PayoutErrorCode
{
    None,
    InvalidRequest,
    NotFound,
    Conflict
}

public sealed record PayoutOperationResult<T>(
    T? Value,
    string? Error,
    PayoutErrorCode ErrorCode)
{
    public static PayoutOperationResult<T> Success(T value) =>
        new(value, null, PayoutErrorCode.None);

    public static PayoutOperationResult<T> Failure(string error, PayoutErrorCode errorCode) =>
        new(default, error, errorCode);
}
