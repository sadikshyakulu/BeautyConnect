using System.Globalization;
using System.Data;
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
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<PaymentService> _logger;
    private string ProductCode => _options.ProductCode.Trim();
    private static readonly TimeSpan PaymentIntentLifetime = TimeSpan.FromMinutes(20);

    public PaymentService(
        BeautyConnectDbContext context,
        HttpClient httpClient,
        IOptions<EsewaOptions> options,
        ILogger<PaymentService> logger)
    {
        _context = context;
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<PaymentOperationResult<EsewaPaymentFormDto>> InitiatePaymentAsync(
        int userId,
        PaymentInitiateDto request,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var customerProfileId = await _context.CustomerProfiles
            .Where(profile => profile.UserId == userId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (!customerProfileId.HasValue)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                "Customer profile not found.",
                PaymentErrorCode.NotFound);
        }

        var service = await _context.Services
            .AsNoTracking()
            .Include(item => item.ProfessionalProfile)
            .FirstOrDefaultAsync(item => item.Id == request.ServiceId, cancellationToken);
        if (service == null || service.ProfessionalProfile.VerificationStatus != VerificationStatus.Approved)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                "The selected verified service was not found.",
                PaymentErrorCode.NotFound);
        }

        if (service.DurationMinutes >= 24 * 60)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                "Service duration must be less than 24 hours.",
                PaymentErrorCode.Conflict);
        }

        if (!BookingScheduleValidator.TryPrepare(
                request.ScheduledDateTime,
                service.DurationMinutes,
                DateTimeOffset.UtcNow,
                out var schedule,
                out var scheduleError,
                _logger))
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                scheduleError ?? "The selected appointment time is invalid.",
                PaymentErrorCode.InvalidRequest);
        }

        var scheduledDate = DateOnly.FromDateTime(schedule.LocalStart);
        var commission = decimal.Round(
            service.Price * _options.CommissionRate,
            2,
            MidpointRounding.AwayFromZero);
        var totalAmount = service.Price + commission;
        var now = DateTime.UtcNow;
        var intent = new PaymentIntent
        {
            CustomerProfileId = customerProfileId.Value,
            ProfessionalProfileId = service.ProfessionalProfileId,
            ServiceId = service.Id,
            ScheduledDateTime = schedule.LocalStart,
            EndDateTime = schedule.LocalEnd,
            TotalPrice = service.Price,
            CommissionAmount = commission,
            EsewaTotalAmount = totalAmount,
            EsewaTransactionUuid = CreateTransactionUuid(service.Id),
            Notes = request.Notes?.Trim(),
            Status = PaymentIntentStatus.Pending,
            ExpiresAt = now.Add(PaymentIntentLifetime),
            CreatedAt = now
        };

        var strategy = _context.Database.CreateExecutionStrategy();
        var (created, error) = await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);
            var availability = await _context.Availabilities
                .Where(slot =>
                    slot.ProfessionalProfileId == service.ProfessionalProfileId
                    && (slot.SpecificDate == scheduledDate
                        || (slot.SpecificDate == null && slot.DayOfWeek == scheduledDate.DayOfWeek)))
                .ToListAsync(cancellationToken);
            if (!BookingScheduleValidator.FitsAvailabilitySlot(availability, new BookingSchedule(schedule.LocalStart, schedule.LocalEnd)))
            {
                await transaction.RollbackAsync(cancellationToken);
                return (Created: false, Error: "The selected time is not within the professional’s availability.");
            }

            var bookingConflict = await _context.Bookings.AnyAsync(booking =>
                booking.ProfessionalProfileId == service.ProfessionalProfileId
                && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed)
                && booking.ScheduledDateTime < schedule.LocalEnd
                && booking.EndDateTime > schedule.LocalStart,
                cancellationToken);
            var pendingPaymentConflict = await _context.PaymentIntents.AnyAsync(paymentIntent =>
                paymentIntent.ProfessionalProfileId == service.ProfessionalProfileId
                && paymentIntent.Status == PaymentIntentStatus.Pending
                && paymentIntent.ExpiresAt > now
                && paymentIntent.ScheduledDateTime < schedule.LocalEnd
                && paymentIntent.EndDateTime > schedule.LocalStart,
                cancellationToken);
            if (bookingConflict || pendingPaymentConflict)
            {
                await transaction.RollbackAsync(cancellationToken);
                return (Created: false, Error: "The selected appointment time is no longer available.");
            }

            _context.PaymentIntents.Add(intent);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return (Created: true, Error: (string?)null);
        });

        if (!created)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                error ?? "Could not reserve the selected appointment time.",
                PaymentErrorCode.Conflict);
        }

        return PaymentOperationResult<EsewaPaymentFormDto>.Success(BuildPaymentForm(intent));
    }

    public async Task<PaymentOperationResult<EsewaPaymentFormDto>> RefreshPaymentAsync(
        int userId,
        string transactionUuid,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var intent = await _context.PaymentIntents
            .Include(item => item.CustomerProfile)
            .FirstOrDefaultAsync(
                item => item.EsewaTransactionUuid == transactionUuid
                    && item.CustomerProfile.UserId == userId,
                cancellationToken);
        if (intent == null)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                "Payment request not found.",
                PaymentErrorCode.NotFound);
        }

        if (intent.Status != PaymentIntentStatus.Pending || intent.ExpiresAt <= DateTime.UtcNow)
        {
            return PaymentOperationResult<EsewaPaymentFormDto>.Failure(
                "This payment request has expired or is no longer pending. Please choose the appointment again.",
                PaymentErrorCode.Conflict);
        }

        return PaymentOperationResult<EsewaPaymentFormDto>.Success(BuildPaymentForm(intent));
    }

    private EsewaPaymentFormDto BuildPaymentForm(PaymentIntent intent)
    {
        var amountText = FormatAmount(intent.TotalPrice);
        var taxAmountText = FormatAmount(0m);
        var totalAmountText = FormatAmount(intent.EsewaTotalAmount);
        var productServiceChargeText = FormatAmount(intent.CommissionAmount);
        var productDeliveryChargeText = FormatAmount(0m);
        var transactionUuid = intent.EsewaTransactionUuid;
        var productCode = ProductCode;
        var signedFieldNames = InitialSignedFields.Split(',');
        var signedValues = new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["total_amount"] = totalAmountText,
            ["transaction_uuid"] = transactionUuid,
            ["product_code"] = productCode
        };
        var signatureMessage = EsewaSignatureHelper.BuildMessage(signedFieldNames, signedValues);
        _logger.LogInformation(
            "eSewa signature raw message: [[[{SignatureMessage}]]]",
            signatureMessage);
        _logger.LogInformation(
            "eSewa signature raw message character codes: {SignatureMessageCharacters}",
            DescribeCharacters(signatureMessage));
        _logger.LogInformation(
            "eSewa signed_field_names: [[[{SignedFieldNames}]]]",
            InitialSignedFields);
        _logger.LogInformation(
            "eSewa total_amount: [[[{TotalAmount}]]]",
            totalAmountText);
        _logger.LogInformation(
            "eSewa transaction_uuid: [[[{TransactionUuid}]]], has_outer_whitespace={HasOuterWhitespace}",
            transactionUuid,
            transactionUuid != transactionUuid.Trim());
        _logger.LogInformation(
            "eSewa product_code: [[[{ProductCode}]]], configured_value_had_outer_whitespace={HadOuterWhitespace}",
            productCode,
            _options.ProductCode != ProductCode);
        _logger.LogInformation(
            "eSewa form amount: [[[{Amount}]]]",
            amountText);
        _logger.LogInformation(
            "eSewa form tax_amount: [[[{TaxAmount}]]]",
            taxAmountText);
        _logger.LogInformation(
            "eSewa form product_service_charge: [[[{ProductServiceCharge}]]]",
            productServiceChargeText);
        _logger.LogInformation(
            "eSewa form product_delivery_charge: [[[{ProductDeliveryCharge}]]]",
            productDeliveryChargeText);

        var componentSum =
            decimal.Parse(amountText, CultureInfo.InvariantCulture)
            + decimal.Parse(taxAmountText, CultureInfo.InvariantCulture)
            + decimal.Parse(productServiceChargeText, CultureInfo.InvariantCulture)
            + decimal.Parse(productDeliveryChargeText, CultureInfo.InvariantCulture);
        var formattedComponentSum = FormatAmount(componentSum);
        _logger.LogInformation(
            "eSewa amount arithmetic: total_amount={TotalAmount}, component_sum={ComponentSum}, matches={Matches}",
            totalAmountText,
            formattedComponentSum,
            string.Equals(totalAmountText, formattedComponentSum, StringComparison.Ordinal));
        var signature = EsewaSignatureHelper.GenerateSignatureFromMessage(
            signatureMessage,
            _options.SecretKey);

        return new EsewaPaymentFormDto(
                PaymentIntentId: intent.Id,
                Amount: amountText,
                TaxAmount: taxAmountText,
                TotalAmount: totalAmountText,
                FormUrl: _options.FormUrl,
                TransactionUuid: transactionUuid,
                ProductCode: productCode,
                SuccessUrl: _options.SuccessUrl,
                FailureUrl: _options.FailureUrl,
                SignedFieldNames: InitialSignedFields,
                Signature: signature,
                ProductServiceCharge: productServiceChargeText,
                ProductDeliveryCharge: productDeliveryChargeText);
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

        if (!string.Equals(callback.ProductCode, ProductCode, StringComparison.Ordinal))
        {
            return PaymentOperationResult<PaymentStatusDto>.Failure(
                "The callback product_code does not match this application.",
                PaymentErrorCode.InvalidRequest);
        }

        var paymentIntent = await _context.PaymentIntents
            .FirstOrDefaultAsync(
                item => item.EsewaTransactionUuid == callback.TransactionUuid,
                cancellationToken);
        if (paymentIntent != null)
        {
            if (paymentIntent.EsewaTotalAmount != callbackTotal)
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    "The callback total_amount does not match the initiated payment.",
                    PaymentErrorCode.InvalidRequest);
            }

            var intentGatewayResult = await CheckGatewayStatusAsync(
                paymentIntent.EsewaTransactionUuid,
                paymentIntent.EsewaTotalAmount,
                cancellationToken);
            return await ApplyGatewayStatusAsync(
                paymentIntent,
                intentGatewayResult,
                callback.TransactionCode,
                cancellationToken);
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
        var paymentIntent = await _context.PaymentIntents
            .FirstOrDefaultAsync(
                item => item.EsewaTransactionUuid == transactionUuid,
                cancellationToken);
        if (paymentIntent != null)
        {
            var intentGatewayResult = await CheckGatewayStatusAsync(
                paymentIntent.EsewaTransactionUuid,
                paymentIntent.EsewaTotalAmount,
                cancellationToken);
            return await ApplyGatewayStatusAsync(
                paymentIntent,
                intentGatewayResult,
                transactionCode: null,
                cancellationToken);
        }

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
        var paymentIntent = await _context.PaymentIntents
            .Include(item => item.CustomerProfile)
            .FirstOrDefaultAsync(
                item => item.EsewaTransactionUuid == transactionUuid
                    && item.CustomerProfile.UserId == userId,
                cancellationToken);
        if (paymentIntent != null)
        {
            var gatewayResult = await CheckGatewayStatusAsync(
                paymentIntent.EsewaTransactionUuid,
                paymentIntent.EsewaTotalAmount,
                cancellationToken);
            return await ApplyGatewayStatusAsync(
                paymentIntent,
                gatewayResult,
                transactionCode: null,
                cancellationToken);
        }

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

        var bookingGatewayResult = await CheckGatewayStatusAsync(
            booking.EsewaTransactionUuid!,
            booking.EsewaTotalAmount.Value,
            cancellationToken);
        return await ApplyGatewayStatusAsync(
            booking,
            bookingGatewayResult,
            transactionCode: null,
            cancellationToken);
    }

    public async Task<PaymentOperationResult<RefundVerificationDto>> VerifyRefundStatusAsync(
        int professionalUserId,
        int bookingId,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        var booking = await _context.Bookings
            .Include(item => item.ProfessionalProfile)
            .FirstOrDefaultAsync(
                item => item.Id == bookingId
                    && item.ProfessionalProfile.UserId == professionalUserId,
                cancellationToken);
        if (booking == null)
        {
            return PaymentOperationResult<RefundVerificationDto>.Failure(
                "Booking not found.",
                PaymentErrorCode.NotFound);
        }

        if (booking.RefundStatus == RefundStatus.Refunded)
        {
            return PaymentOperationResult<RefundVerificationDto>.Success(
                ToRefundVerification(booking));
        }

        if (booking.RefundStatus != RefundStatus.Requested
            || string.IsNullOrWhiteSpace(booking.EsewaTransactionUuid)
            || string.IsNullOrWhiteSpace(booking.EsewaTransactionCode)
            || !booking.EsewaTotalAmount.HasValue)
        {
            return PaymentOperationResult<RefundVerificationDto>.Failure(
                "This booking has no eligible eSewa refund request.",
                PaymentErrorCode.Conflict);
        }

        var gatewayStatus = await CheckGatewayStatusAsync(
            booking.EsewaTransactionUuid,
            booking.EsewaTotalAmount.Value,
            cancellationToken);
        if (!string.Equals(
                gatewayStatus.TransactionUuid,
                booking.EsewaTransactionUuid,
                StringComparison.Ordinal)
            || !string.Equals(gatewayStatus.ProductCode, ProductCode, StringComparison.Ordinal)
            || gatewayStatus.TotalAmount != booking.EsewaTotalAmount)
        {
            return PaymentOperationResult<RefundVerificationDto>.Failure(
                "The eSewa status response does not match this booking's payment.",
                PaymentErrorCode.InvalidRequest);
        }

        if (gatewayStatus.Status.Equals("PARTIAL_REFUND", StringComparison.OrdinalIgnoreCase))
        {
            return PaymentOperationResult<RefundVerificationDto>.Failure(
                "eSewa reports a partial refund. Partial refund amounts are not yet supported here; contact support before closing this request.",
                PaymentErrorCode.Conflict);
        }

        if (!gatewayStatus.Status.Equals("FULL_REFUND", StringComparison.OrdinalIgnoreCase))
        {
            return PaymentOperationResult<RefundVerificationDto>.Failure(
                "eSewa has not confirmed a full refund yet. Process the refund through your eSewa merchant refund channel, then check again.",
                PaymentErrorCode.Conflict);
        }

        if (string.IsNullOrWhiteSpace(gatewayStatus.TransactionCode))
        {
            return PaymentOperationResult<RefundVerificationDto>.Failure(
                "eSewa confirmed the refund without a reference. Contact support to verify it before closing this request.",
                PaymentErrorCode.Conflict);
        }

        booking.RefundStatus = RefundStatus.Refunded;
        booking.RefundAmount = booking.EsewaTotalAmount.Value;
        booking.RefundedAt = DateTime.UtcNow;
        booking.RefundGatewayReference = gatewayStatus.TransactionCode;
        await _context.SaveChangesAsync(cancellationToken);

        return PaymentOperationResult<RefundVerificationDto>.Success(
            ToRefundVerification(booking));
    }

    private static RefundVerificationDto ToRefundVerification(Booking booking) =>
        new(
            booking.Id,
            booking.RefundStatus.ToString(),
            booking.RefundAmount ?? 0m,
            booking.RefundedAt,
            booking.RefundGatewayReference);

    private async Task<PaymentOperationResult<PaymentStatusDto>> ApplyGatewayStatusAsync(
        PaymentIntent paymentIntent,
        GatewayStatus gatewayStatus,
        string? transactionCode,
        CancellationToken cancellationToken)
    {
        if (gatewayStatus.Status.Equals("COMPLETE", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.Equals(
                    gatewayStatus.TransactionUuid,
                    paymentIntent.EsewaTransactionUuid,
                    StringComparison.Ordinal)
                || !string.Equals(gatewayStatus.ProductCode, ProductCode, StringComparison.Ordinal)
                || gatewayStatus.TotalAmount != paymentIntent.EsewaTotalAmount)
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    "The eSewa status response does not match the payment request.",
                    PaymentErrorCode.InvalidRequest);
            }

            var confirmedTransactionCode = transactionCode ?? gatewayStatus.TransactionCode;
            if (string.IsNullOrWhiteSpace(confirmedTransactionCode))
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    "eSewa confirmed payment without returning a transaction code.",
                    PaymentErrorCode.Conflict);
            }

            if (paymentIntent.Status == PaymentIntentStatus.Completed)
            {
                var existingBooking = await _context.Bookings
                    .FirstOrDefaultAsync(
                        item => item.EsewaTransactionUuid == paymentIntent.EsewaTransactionUuid,
                        cancellationToken);
                if (existingBooking != null && paymentIntent.Booking == null)
                {
                    paymentIntent.Booking = existingBooking;
                    await _context.SaveChangesAsync(cancellationToken);
                }
                return existingBooking == null
                    ? PaymentOperationResult<PaymentStatusDto>.Failure(
                        "The completed payment has no associated booking.",
                        PaymentErrorCode.Conflict)
                    : PaymentOperationResult<PaymentStatusDto>.Success(ToPaymentStatus(
                        existingBooking,
                        gatewayStatus.Status));
            }

            if (paymentIntent.Status != PaymentIntentStatus.Pending)
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    "This payment request is no longer pending.",
                    PaymentErrorCode.Conflict);
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            var (bookingId, error) = await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken);
                var existing = await _context.Bookings
                    .FirstOrDefaultAsync(
                        item => item.EsewaTransactionUuid == paymentIntent.EsewaTransactionUuid,
                        cancellationToken);
                if (existing != null)
                {
                    paymentIntent.Status = PaymentIntentStatus.Completed;
                    paymentIntent.EsewaTransactionCode = confirmedTransactionCode;
                    paymentIntent.Booking = existing;
                    await _context.SaveChangesAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);
                    return (BookingId: (int?)existing.Id, Error: (string?)null);
                }

                var hasConflict = await _context.Bookings.AnyAsync(booking =>
                    booking.ProfessionalProfileId == paymentIntent.ProfessionalProfileId
                    && (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed)
                    && booking.ScheduledDateTime < paymentIntent.EndDateTime
                    && booking.EndDateTime > paymentIntent.ScheduledDateTime,
                    cancellationToken);
                if (hasConflict)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return (BookingId: (int?)null, Error: "Payment succeeded, but the appointment time has since been booked. Contact support to resolve the payment.");
                }

                var booking = new Booking
                {
                    CustomerProfileId = paymentIntent.CustomerProfileId,
                    ProfessionalProfileId = paymentIntent.ProfessionalProfileId,
                    ServiceId = paymentIntent.ServiceId,
                    ScheduledDateTime = paymentIntent.ScheduledDateTime,
                    EndDateTime = paymentIntent.EndDateTime,
                    Status = BookingStatus.Confirmed,
                    TotalPrice = paymentIntent.TotalPrice,
                    CommissionAmount = paymentIntent.CommissionAmount,
                    EsewaTransactionUuid = paymentIntent.EsewaTransactionUuid,
                    EsewaTransactionCode = confirmedTransactionCode,
                    EsewaTotalAmount = paymentIntent.EsewaTotalAmount,
                    Notes = paymentIntent.Notes
                };
                _context.Bookings.Add(booking);
                paymentIntent.Booking = booking;
                paymentIntent.Status = PaymentIntentStatus.Completed;
                paymentIntent.EsewaTransactionCode = confirmedTransactionCode;
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return (BookingId: (int?)booking.Id, Error: (string?)null);
            });

            if (bookingId == null)
            {
                return PaymentOperationResult<PaymentStatusDto>.Failure(
                    error ?? "Could not create a booking for this successful payment.",
                    PaymentErrorCode.Conflict);
            }

            var createdBooking = await GetBookingByTransactionUuidAsync(
                paymentIntent.EsewaTransactionUuid,
                cancellationToken);
            return createdBooking == null
                ? PaymentOperationResult<PaymentStatusDto>.Failure(
                    "The booking was created but could not be loaded.",
                    PaymentErrorCode.Conflict)
                : PaymentOperationResult<PaymentStatusDto>.Success(ToPaymentStatus(
                    createdBooking,
                    gatewayStatus.Status));
        }

        if (gatewayStatus.Status.Equals("CANCELED", StringComparison.OrdinalIgnoreCase)
            && paymentIntent.Status == PaymentIntentStatus.Pending)
        {
            paymentIntent.Status = PaymentIntentStatus.Cancelled;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return PaymentOperationResult<PaymentStatusDto>.Success(
            new PaymentStatusDto(
                BookingId: null,
                paymentIntent.EsewaTransactionUuid,
                gatewayStatus.Status,
                paymentIntent.Status.ToString(),
                IsPaid: false,
                paymentIntent.EsewaTransactionCode,
                paymentIntent.EsewaTotalAmount));
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
                    ProductCode,
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
        var url = $"{_options.StatusCheckUrl}?product_code={Uri.EscapeDataString(ProductCode)}"
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

    private static PaymentStatusDto ToPaymentStatus(Booking booking, string gatewayStatus) =>
        new(
            booking.Id,
            booking.EsewaTransactionUuid!,
            gatewayStatus,
            booking.Status.ToString(),
            booking.Status == BookingStatus.Confirmed,
            booking.EsewaTransactionCode,
            booking.EsewaTotalAmount!.Value);

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
        amount.ToString("0.##", CultureInfo.InvariantCulture);

    private static string DescribeCharacters(string value) =>
        string.Join(
            " ",
            value.Select(character => $"U+{(int)character:X4}"));

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
