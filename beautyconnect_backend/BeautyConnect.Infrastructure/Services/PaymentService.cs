using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Configuration;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BeautyConnect.Infrastructure.Services;

public sealed class PaymentService : IPaymentService
{
    private const string InitialSignedFields = "total_amount,transaction_uuid,product_code";
    private const int MaximumCallbackLength = 32_768;
    private static readonly string[] RequiredCallbackSignedFields =
        ["transaction_uuid", "total_amount", "product_code", "status", "transaction_code"];

    private readonly BeautyConnectDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly EsewaOptions _options;

    public PaymentService(
        BeautyConnectDbContext context,
        HttpClient httpClient,
        IOptions<EsewaOptions> options)
    {
        _context = context;
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<PaymentOperationResult<EsewaPaymentFormDto>> InitiatePaymentAsync(
        int userId,
        int bookingId,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var booking = await _context.Bookings
            .Include(item => item.Service)
            .Include(item => item.CustomerProfile)
            .FirstOrDefaultAsync(
                item => item.Id == bookingId && item.CustomerProfile.UserId == userId,
                cancellationToken);
        if (booking == null)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                "Booking not found.",
                PaymentErrorCode.NotFound);
        }

        if (booking.Status != BookingStatus.Pending)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                $"Payment cannot be initiated for a booking in status {booking.Status}.",
                PaymentErrorCode.Conflict);
        }

        decimal amount;
        decimal commission;
        decimal totalAmount;
        if (booking.EsewaTransactionUuid != null)
        {
            if (!booking.EsewaTotalAmount.HasValue)
            {
                return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                    "The existing eSewa payment attempt is incomplete.",
                    PaymentErrorCode.Conflict);
            }

            amount = booking.TotalPrice;
            totalAmount = booking.EsewaTotalAmount.Value;
            commission = totalAmount - amount;
        }
        else
        {
            amount = booking.Service.Price;
            if (amount <= 0)
            {
                return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                    "The service price must be greater than zero.",
                    PaymentErrorCode.Conflict);
            }

            commission = decimal.Round(
                amount * _options.CommissionRate,
                2,
                MidpointRounding.AwayFromZero);
            totalAmount = amount + commission;
            booking.TotalPrice = amount;
            booking.EsewaTotalAmount = totalAmount;
            booking.EsewaTransactionUuid = CreateTransactionUuid(booking.Id);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var values = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["total_amount"] = FormatAmount(totalAmount),
            ["transaction_uuid"] = booking.EsewaTransactionUuid,
            ["product_code"] = _options.ProductCode
        };
        var signature = EsewaSignatureHelper.GenerateSignature(
            InitialSignedFields.Split(','),
            values,
            _options.SecretKey);

        return PaymentOperationResult<EsewaPaymentFormDto>.Success(
            new EsewaPaymentFormDto(
                Amount: FormatAmount(amount),
                TaxAmount: FormatAmount(0m),
                TotalAmount: FormatAmount(totalAmount),
                FormUrl: _options.FormUrl,
                TransactionUuid: booking.EsewaTransactionUuid,
                ProductCode: _options.ProductCode,
                SuccessUrl: _options.SuccessUrl,
                FailureUrl: _options.FailureUrl,
                SignedFieldNames: InitialSignedFields,
                Signature: signature,
                ProductServiceCharge: FormatAmount(commission),
                ProductDeliveryCharge: FormatAmount(0m)));
    }

    public async Task<PaymentOperationResult<PaymentStatusDto>> VerifyPaymentCallbackAsync(
        string encodedResponse,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var parsed = TryParseAndVerifyCallback(encodedResponse);
        if (parsed.Callback == null)
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                parsed.Error!,
                PaymentErrorCode.InvalidRequest);
        }

        var callback = parsed.Callback;
        if (!decimal.TryParse(
                callback.TotalAmount,
                NumberStyles.Number,
                CultureInfo.InvariantCulture,
                out var callbackTotal))
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "The callback total_amount is invalid.",
                PaymentErrorCode.InvalidRequest);
        }

        if (!string.Equals(callback.ProductCode, _options.ProductCode, StringComparison.Ordinal))
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "The callback product_code does not match this application.",
                PaymentErrorCode.InvalidRequest);
        }

        var booking = await GetBookingByTransactionUuidAsync(
            callback.TransactionUuid,
            cancellationToken);
        if (booking == null)
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "No booking matches the eSewa transaction.",
                PaymentErrorCode.NotFound);
        }

        if (booking.EsewaTotalAmount != callbackTotal)
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "The callback total_amount does not match the initiated payment.",
                PaymentErrorCode.InvalidRequest);
        }

        var gatewayResult = await CheckGatewayStatusAsync(
            booking.EsewaTransactionUuid!,
            booking.EsewaTotalAmount.Value,
            cancellationToken);
        return await ApplyGatewayStatusAsync(
            booking,
            gatewayResult,
            callback.TransactionCode,
            cancellationToken);
    }

    public async Task<PaymentOperationResult<PaymentStatusDto>> HandleFailureCallbackAsync(
        string transactionUuid,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var booking = await GetBookingByTransactionUuidAsync(transactionUuid, cancellationToken);
        if (booking == null)
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "No booking matches the eSewa transaction.",
                PaymentErrorCode.NotFound);
        }

        var gatewayResult = await CheckGatewayStatusAsync(
            booking.EsewaTransactionUuid!,
            booking.EsewaTotalAmount!.Value,
            cancellationToken);
        return await ApplyGatewayStatusAsync(
            booking,
            gatewayResult,
            transactionCode: null,
            cancellationToken);
    }

    public async Task<PaymentOperationResult<PaymentStatusDto>> CheckTransactionStatusAsync(
        int userId,
        string transactionUuid,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var booking = await _context.Bookings
            .Include(item => item.CustomerProfile)
            .FirstOrDefaultAsync(
                item => item.EsewaTransactionUuid == transactionUuid
                    && item.CustomerProfile.UserId == userId,
                cancellationToken);
        if (booking == null)
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "Payment transaction not found.",
                PaymentErrorCode.NotFound);
        }

        if (!booking.EsewaTotalAmount.HasValue)
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "The eSewa transaction has no stored total amount.",
                PaymentErrorCode.Conflict);
        }

        var gatewayResult = await CheckGatewayStatusAsync(
            booking.EsewaTransactionUuid!,
            booking.EsewaTotalAmount.Value,
            cancellationToken);
        return await ApplyGatewayStatusAsync(
            booking,
            gatewayResult,
            transactionCode: null,
            cancellationToken);
    }

    private async Task<PaymentOperationResult<PaymentStatusDto>> ApplyGatewayStatusAsync(
        Booking booking,
        GatewayStatus gatewayStatus,
        string? transactionCode,
        CancellationToken cancellationToken)
    {
        if (gatewayStatus.Status.Equals("COMPLETE", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.Equals(
                    gatewayStatus.TransactionUuid,
                    booking.EsewaTransactionUuid,
                    StringComparison.Ordinal)
                || !string.Equals(
                    gatewayStatus.ProductCode,
                    _options.ProductCode,
                    StringComparison.Ordinal)
                || gatewayStatus.TotalAmount != booking.EsewaTotalAmount)
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    "The eSewa status response does not match the initiated transaction.",
                    PaymentErrorCode.InvalidRequest);
            }

            var confirmedTransactionCode = transactionCode ?? gatewayStatus.TransactionCode;
            if (string.IsNullOrWhiteSpace(confirmedTransactionCode))
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    "eSewa confirmed payment without returning a transaction code.",
                    PaymentErrorCode.Conflict);
            }

            if (booking.Status == BookingStatus.Pending)
            {
                booking.Status = BookingStatus.Confirmed;
                booking.EsewaTransactionCode = confirmedTransactionCode;
                booking.CommissionAmount = booking.EsewaTotalAmount!.Value - booking.TotalPrice;
                await _context.SaveChangesAsync(cancellationToken);
            }
            else if (booking.Status != BookingStatus.Confirmed
                || !string.Equals(
                    booking.EsewaTransactionCode,
                    confirmedTransactionCode,
                    StringComparison.Ordinal))
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    $"Payment cannot confirm a booking in status {booking.Status}.",
                    PaymentErrorCode.Conflict);
            }
        }
        else if (gatewayStatus.Status.Equals("CANCELED", StringComparison.OrdinalIgnoreCase)
            && booking.Status == BookingStatus.Pending)
        {
            booking.Status = BookingStatus.Cancelled;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return PaymentOperationResult<PaymentStatusDto>.Success(
            new PaymentStatusDto(
                booking.Id,
                booking.EsewaTransactionUuid!,
                gatewayStatus.Status,
                booking.Status.ToString(),
                booking.Status == BookingStatus.Confirmed,
                booking.EsewaTransactionCode,
                booking.EsewaTotalAmount!.Value));
    }

    private async Task<GatewayStatus> CheckGatewayStatusAsync(
        string transactionUuid,
        decimal totalAmount,
        CancellationToken cancellationToken)
    {
        var url = $"{_options.StatusCheckUrl}?product_code={Uri.EscapeDataString(_options.ProductCode)}"
            + $"&total_amount={Uri.EscapeDataString(FormatAmount(totalAmount))}"
            + $"&transaction_uuid={Uri.EscapeDataString(transactionUuid)}";
        using var response = await _httpClient.GetAsync(url, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(
            responseStream,
            cancellationToken: cancellationToken);
        var root = document.RootElement;
        var status = GetJsonValue(root, "status")
            ?? throw new InvalidOperationException("eSewa status response has no status field.");
        var responseUuid = GetJsonValue(root, "transaction_uuid");
        var responseProductCode = GetJsonValue(root, "product_code");
        var responseAmountText = GetJsonValue(root, "total_amount");
        decimal? responseAmount = decimal.TryParse(
            responseAmountText,
            NumberStyles.Number,
            CultureInfo.InvariantCulture,
            out var parsedAmount)
            ? parsedAmount
            : null;
        var transactionCode = GetJsonValue(root, "transaction_code")
            ?? GetJsonValue(root, "ref_id");

        return new GatewayStatus(
            status,
            responseUuid,
            responseProductCode,
            responseAmount,
            transactionCode);
    }

    private async Task<Booking?> GetBookingByTransactionUuidAsync(
        string transactionUuid,
        CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .FirstOrDefaultAsync(
                booking => booking.EsewaTransactionUuid == transactionUuid,
                cancellationToken);
    }

    private CallbackParseResult TryParseAndVerifyCallback(string encodedResponse)
    {
        if (string.IsNullOrWhiteSpace(encodedResponse)
            || encodedResponse.Length > MaximumCallbackLength)
        {
            return CallbackParseResult.Fail("The eSewa callback data is missing or too large.");
        }

        try
        {
            var jsonBytes = DecodeBase64(encodedResponse);
            using var document = JsonDocument.Parse(jsonBytes);
            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                return CallbackParseResult.Fail("The eSewa callback must be a JSON object.");
            }

            var values = new Dictionary<string, string>(StringComparer.Ordinal);
            foreach (var property in document.RootElement.EnumerateObject())
            {
                if (property.Value.ValueKind == JsonValueKind.String)
                {
                    values[property.Name] = property.Value.GetString() ?? string.Empty;
                }
                else if (property.Value.ValueKind == JsonValueKind.Number)
                {
                    values[property.Name] = property.Value.GetRawText();
                }
            }

            if (!values.TryGetValue("signed_field_names", out var signedFieldNamesText)
                || !values.TryGetValue("signature", out var suppliedSignature))
            {
                return CallbackParseResult.Fail(
                    "The eSewa callback is missing signed_field_names or signature.");
            }

            var signedFieldNames = signedFieldNamesText
                .Split(',', StringSplitOptions.TrimEntries);
            if (signedFieldNames.Any(string.IsNullOrWhiteSpace)
                || RequiredCallbackSignedFields.Any(field => !signedFieldNames.Contains(field, StringComparer.Ordinal)))
            {
                return CallbackParseResult.Fail(
                    "The eSewa callback does not sign all required payment fields.");
            }

            foreach (var fieldName in signedFieldNames)
            {
                if (!values.ContainsKey(fieldName))
                {
                    return CallbackParseResult.Fail(
                        $"The signed eSewa callback field '{fieldName}' is missing.");
                }
            }

            var calculatedSignature = EsewaSignatureHelper.GenerateSignature(
                signedFieldNames,
                values,
                _options.SecretKey);
            if (!SignaturesMatch(calculatedSignature, suppliedSignature))
            {
                return CallbackParseResult.Fail("The eSewa callback signature is invalid.");
            }

            if (!values.TryGetValue("transaction_uuid", out var transactionUuid)
                || !values.TryGetValue("total_amount", out var totalAmount)
                || !values.TryGetValue("product_code", out var productCode)
                || !values.TryGetValue("status", out var status))
            {
                return CallbackParseResult.Fail("The eSewa callback is missing payment details.");
            }

            values.TryGetValue("transaction_code", out var transactionCode);
            return CallbackParseResult.Success(
                new VerifiedCallback(
                    transactionUuid,
                    totalAmount,
                    productCode,
                    status,
                    transactionCode));
        }
        catch (FormatException)
        {
            return CallbackParseResult.Fail("The eSewa callback is not valid Base64.");
        }
        catch (JsonException)
        {
            return CallbackParseResult.Fail("The eSewa callback does not contain valid JSON.");
        }
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_options.SecretKey)
            || string.IsNullOrWhiteSpace(_options.ProductCode)
            || !Uri.TryCreate(_options.FormUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_options.StatusCheckUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_options.SuccessUrl, UriKind.Absolute, out _)
            || !Uri.TryCreate(_options.FailureUrl, UriKind.Absolute, out _)
            || _options.CommissionRate < 0m
            || _options.CommissionRate > 1m)
        {
            throw new InvalidOperationException(
                "eSewa configuration is incomplete or invalid. Set the Esewa options and provide Esewa:SecretKey through user-secrets or an environment variable.");
        }
    }

    private static byte[] DecodeBase64(string encodedResponse)
    {
        var base64 = encodedResponse.Replace(' ', '+').Replace('-', '+').Replace('_', '/');
        base64 = base64.PadRight(base64.Length + ((4 - base64.Length % 4) % 4), '=');
        return Convert.FromBase64String(base64);
    }

    private static bool SignaturesMatch(string expectedSignature, string suppliedSignature)
    {
        try
        {
            var expectedBytes = Convert.FromBase64String(expectedSignature);
            var suppliedBytes = Convert.FromBase64String(suppliedSignature);
            return expectedBytes.Length == suppliedBytes.Length
                && CryptographicOperations.FixedTimeEquals(expectedBytes, suppliedBytes);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static string? GetJsonValue(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.String => property.GetString(),
            JsonValueKind.Number => property.GetRawText(),
            _ => null
        };
    }

    private static string CreateTransactionUuid(int bookingId) =>
        $"B{bookingId}-{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}";

    private static string FormatAmount(decimal amount) =>
        amount.ToString("0.00", CultureInfo.InvariantCulture);

    private sealed record VerifiedCallback(
        string TransactionUuid,
        string TotalAmount,
        string ProductCode,
        string Status,
        string? TransactionCode);

    private sealed record CallbackParseResult(VerifiedCallback? Callback, string? Error)
    {
        public static CallbackParseResult Success(VerifiedCallback callback) => new(callback, null);
        public static CallbackParseResult Fail(string error) => new(null, error);
    }

    private sealed record GatewayStatus(
        string Status,
        string? TransactionUuid,
        string? ProductCode,
        decimal? TotalAmount,
        string? TransactionCode);
}
