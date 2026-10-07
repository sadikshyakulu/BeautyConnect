using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/payment")]
[Authorize]
public sealed class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly EsewaOptions _options;

    public PaymentController(
        IPaymentService paymentService,
        IOptions<EsewaOptions> options)
    {
        _paymentService = paymentService;
        _options = options.Value;
    }

    [HttpPost("initiate")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType<EsewaPaymentFormDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CreatePaymentIntent(
        [FromBody] PaymentInitiateDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await _paymentService.InitiatePaymentAsync(
            userId,
            request,
            cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("initiate/{transactionUuid}/refresh")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType<EsewaPaymentFormDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> RefreshPayment(
        string transactionUuid,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await _paymentService.RefreshPaymentAsync(
            userId,
            transactionUuid,
            cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("success")]
    [AllowAnonymous]
    public async Task<IActionResult> Success(
        [FromQuery] string? data,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.VerifyPaymentCallbackAsync(
            data ?? string.Empty,
            cancellationToken);
        return RedirectToFrontend(result.Value switch
        {
            { IsPaid: true } => "success",
            { BookingStatus: "Pending" } => "pending",
            not null => "failed",
            _ => "error"
        }, result.Value?.BookingId);
    }

    [HttpGet("failure")]
    [AllowAnonymous]
    public async Task<IActionResult> Failure(
        [FromQuery(Name = "transaction_uuid")] string? transactionUuid,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(transactionUuid))
        {
            return RedirectToFrontend("error");
        }

        var result = await _paymentService.HandleFailureCallbackAsync(
            transactionUuid,
            cancellationToken);
        return RedirectToFrontend(
            result.Value switch
            {
                { IsPaid: true } => "success",
                { BookingStatus: "Pending" } => "pending",
                not null => "failed",
                _ => "error"
            },
            result.Value?.BookingId);
    }

    [HttpGet("status/{transactionUuid}")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType<PaymentStatusDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckStatus(
        string transactionUuid,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await _paymentService.CheckTransactionStatusAsync(
            userId,
            transactionUuid,
            cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost("bookings/{bookingId:int}/refund/verify")]
    [Authorize(Roles = "Professional")]
    [ProducesResponseType<RefundVerificationDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyBookingRefund(
        int bookingId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = await _paymentService.VerifyRefundStatusAsync(
            userId,
            bookingId,
            cancellationToken);
        return ToActionResult(result);
    }

    private IActionResult ToActionResult<T>(PaymentOperationResult<T> result)
    {
        if (result.Value != null)
        {
            return Ok(result.Value);
        }

        var statusCode = result.ErrorCode switch
        {
            PaymentErrorCode.NotFound => StatusCodes.Status404NotFound,
            PaymentErrorCode.Conflict => StatusCodes.Status409Conflict,
            PaymentErrorCode.InvalidRequest => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
        return StatusCode(statusCode, new { message = result.Error });
    }

    private IActionResult RedirectToFrontend(string paymentStatus, int? bookingId = null)
    {
        if (!Uri.TryCreate(_options.FrontendReturnUrl, UriKind.Absolute, out var frontendReturnUrl)
            || (frontendReturnUrl.Scheme != Uri.UriSchemeHttp
                && frontendReturnUrl.Scheme != Uri.UriSchemeHttps))
        {
            throw new InvalidOperationException(
                "Esewa:FrontendReturnUrl must be configured as an absolute HTTP(S) URL.");
        }

        var query = $"payment={Uri.EscapeDataString(paymentStatus)}";
        if (bookingId.HasValue)
        {
            query += $"&bookingId={bookingId.Value}";
        }

        var redirectUrl = new UriBuilder(frontendReturnUrl)
        {
            Query = query
        };
        return Redirect(redirectUrl.Uri.ToString());
    }

    private bool TryGetUserId(out int userId)
    {
        return int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }
}
