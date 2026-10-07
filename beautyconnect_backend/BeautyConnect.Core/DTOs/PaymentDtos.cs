using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BeautyConnect.Core.DTOs;

public sealed class PaymentInitiateDto
{
    [Range(1, int.MaxValue)]
    public int ServiceId { get; set; }

    [Required]
    public DateTimeOffset ScheduledDateTime { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }
}

public sealed record EsewaPaymentFormDto(
    [property: JsonPropertyName("payment_intent_id")] int PaymentIntentId,
    string Amount,
    [property: JsonPropertyName("tax_amount")] string TaxAmount,
    [property: JsonPropertyName("total_amount")] string TotalAmount,
    [property: JsonPropertyName("form_url")] string FormUrl,
    [property: JsonPropertyName("transaction_uuid")] string TransactionUuid,
    [property: JsonPropertyName("product_code")] string ProductCode,
    [property: JsonPropertyName("success_url")] string SuccessUrl,
    [property: JsonPropertyName("failure_url")] string FailureUrl,
    [property: JsonPropertyName("signed_field_names")] string SignedFieldNames,
    string Signature,
    [property: JsonPropertyName("product_service_charge")] string ProductServiceCharge,
    [property: JsonPropertyName("product_delivery_charge")] string ProductDeliveryCharge);

public sealed record PaymentStatusDto(
    int? BookingId,
    string TransactionUuid,
    string GatewayStatus,
    string BookingStatus,
    bool IsPaid,
    string? TransactionCode,
    decimal TotalAmount);

public sealed record RefundVerificationDto(
    int BookingId,
    string RefundStatus,
    decimal RefundAmount,
    DateTime? RefundedAt,
    string? GatewayReference);

public enum PaymentErrorCode
{
    None,
    InvalidRequest,
    NotFound,
    Conflict
}

public sealed record PaymentOperationResult<T>(
    T? Value,
    string? Error,
    PaymentErrorCode ErrorCode)
{
    public static PaymentOperationResult<T> Success(T value) =>
        new(value, null, PaymentErrorCode.None);

    public static PaymentOperationResult<T> Failure(string error, PaymentErrorCode errorCode) =>
        new(default, error, errorCode);
}
