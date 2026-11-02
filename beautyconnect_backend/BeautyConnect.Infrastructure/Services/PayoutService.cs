using System.Data;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Configuration;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BeautyConnect.Infrastructure.Services;

public sealed class PayoutService : IPayoutService
{
    private readonly BeautyConnectDbContext _context;
    private readonly IPayoutDetailsProtector _protector;
    private readonly PayoutOptions _options;
    private readonly TimeProvider _timeProvider;

    public PayoutService(
        BeautyConnectDbContext context,
        IPayoutDetailsProtector protector,
        IOptions<PayoutOptions> options,
        TimeProvider timeProvider)
    {
        _context = context;
        _protector = protector;
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public async Task<PayoutDetailsDto?> GetPayoutDetailsAsync(int professionalUserId)
    {
        var profile = await _context.ProfessionalProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserId == professionalUserId);
        return profile == null ? null : ToPayoutDetails(profile);
    }

    public async Task<PayoutOperationResult<PayoutDetailsDto>> UpdatePayoutDetailsAsync(
        int professionalUserId,
        PayoutDetailsUpdateDto request)
    {
        var profile = await _context.ProfessionalProfiles
            .FirstOrDefaultAsync(item => item.UserId == professionalUserId);
        if (profile == null)
        {
            return PayoutOperationResult<PayoutDetailsDto>.Failure(
                "Professional profile not found.",
                PayoutErrorCode.NotFound);
        }

        var requestedMethod = request.PayoutMethod.Trim();
        if (!requestedMethod.Equals("eSewa", StringComparison.OrdinalIgnoreCase)
            && !requestedMethod.Equals("Bank", StringComparison.OrdinalIgnoreCase))
        {
            return PayoutOperationResult<PayoutDetailsDto>.Failure(
                "Payout method must be eSewa or Bank.",
                PayoutErrorCode.InvalidRequest);
        }

        var method = requestedMethod.Equals("eSewa", StringComparison.OrdinalIgnoreCase)
            ? "eSewa"
            : "Bank";
        var accountName = request.AccountName.Trim();
        var accountNumber = request.AccountNumber.Trim();
        var bankName = request.BankName?.Trim();
        if (accountName.Length is < 2 or > 100
            || (method == "eSewa" && !System.Text.RegularExpressions.Regex.IsMatch(accountNumber, @"^9[678]\d{8}$"))
            || (method == "Bank" && !System.Text.RegularExpressions.Regex.IsMatch(accountNumber, @"^\d{6,30}$"))
            || (method == "Bank" && string.IsNullOrWhiteSpace(bankName)))
        {
            return PayoutOperationResult<PayoutDetailsDto>.Failure(
                "Payout account details are invalid.",
                PayoutErrorCode.InvalidRequest);
        }

        profile.PayoutMethod = method;
        profile.PayoutAccountName = accountName;
        profile.PayoutAccountNumberEncrypted = _protector.Protect(accountNumber);
        profile.PayoutBankName = method == "Bank" ? bankName : null;
        await _context.SaveChangesAsync();

        return PayoutOperationResult<PayoutDetailsDto>.Success(ToPayoutDetails(profile));
    }

    public async Task<PayoutOperationResult<PayoutEarningsSummaryDto>> GetEarningsSummaryAsync(
        int professionalUserId)
    {
        var professionalProfileId = await GetProfessionalProfileIdAsync(professionalUserId);
        if (!professionalProfileId.HasValue)
        {
            return PayoutOperationResult<PayoutEarningsSummaryDto>.Failure(
                "Professional profile not found.",
                PayoutErrorCode.NotFound);
        }

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var availableBefore = now.AddHours(-_options.HoldHours);
        var pendingBookings = await GetPendingBookingsQuery(availableBefore)
            .Where(booking => booking.ProfessionalProfileId == professionalProfileId.Value)
            .Select(booking => booking.ProfessionalPayoutAmount)
            .ToListAsync();
        var availableBookings = await GetAvailableBookingsQuery(
                availableBefore)
            .Where(booking => booking.ProfessionalProfileId == professionalProfileId.Value)
            .Select(booking => booking.ProfessionalPayoutAmount)
            .ToListAsync();
        var requestedAmounts = await _context.PayoutRequests
            .Where(request =>
                request.ProfessionalProfileId == professionalProfileId.Value
                && request.Status == PayoutRequestStatus.Requested)
            .Select(request => request.Amount)
            .ToListAsync();
        var paidOutAmounts = await _context.PayoutRequests
            .Where(request =>
                request.ProfessionalProfileId == professionalProfileId.Value
                && request.Status == PayoutRequestStatus.Paid)
            .Select(request => request.Amount)
            .ToListAsync();
        var pending = pendingBookings.Sum();
        var available = availableBookings.Sum();
        var requested = requestedAmounts.Sum();
        var paidOut = paidOutAmounts.Sum();

        return PayoutOperationResult<PayoutEarningsSummaryDto>.Success(
            new PayoutEarningsSummaryDto(pending, available, requested, paidOut));
    }

    public async Task<PayoutOperationResult<PayoutRequestSummaryDto>> RequestPayoutAsync(
        int professionalUserId)
    {
        var professionalProfile = await _context.ProfessionalProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile => profile.UserId == professionalUserId);
        if (professionalProfile == null)
        {
            return PayoutOperationResult<PayoutRequestSummaryDto>.Failure(
                "Professional profile not found.",
                PayoutErrorCode.NotFound);
        }

        if (string.IsNullOrWhiteSpace(professionalProfile.PayoutMethod)
            || string.IsNullOrWhiteSpace(professionalProfile.PayoutAccountName)
            || string.IsNullOrWhiteSpace(professionalProfile.PayoutAccountNumberEncrypted))
        {
            return PayoutOperationResult<PayoutRequestSummaryDto>.Failure(
                "Add valid payout details before requesting a payout.",
                PayoutErrorCode.InvalidRequest);
        }

        var executionStrategy = _context.Database.CreateExecutionStrategy();
        try
        {
            var result = await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable);
                var existingRequest = await _context.PayoutRequests
                    .AnyAsync(request =>
                        request.OpenProfessionalProfileId == professionalProfile.Id);
                if (existingRequest)
                {
                    await transaction.RollbackAsync();
                    return PayoutOperationResult<PayoutRequestSummaryDto>.Failure(
                        "A payout request is already in progress.",
                        PayoutErrorCode.Conflict);
                }

                var now = _timeProvider.GetUtcNow().UtcDateTime;
                var eligibleBefore = now.AddHours(-_options.HoldHours);
                var eligible = await GetAvailableBookingsQuery(
                        eligibleBefore)
                    .Where(booking => booking.ProfessionalProfileId == professionalProfile.Id)
                    .Select(booking => new { booking.Id, booking.ProfessionalPayoutAmount })
                    .ToListAsync();
                var amount = eligible.Sum(booking => booking.ProfessionalPayoutAmount);
                if (amount < _options.MinimumAmount)
                {
                    await transaction.RollbackAsync();
                    return PayoutOperationResult<PayoutRequestSummaryDto>.Failure(
                        $"Available balance must be at least {_options.MinimumAmount:0.00} to request a payout.",
                        PayoutErrorCode.Conflict);
                }

                var payoutRequest = new PayoutRequest
                {
                    ProfessionalProfileId = professionalProfile.Id,
                    Amount = amount,
                    Status = PayoutRequestStatus.Requested,
                    RequestedAt = now,
                    PayoutMethod = professionalProfile.PayoutMethod!,
                    AccountName = professionalProfile.PayoutAccountName!,
                    AccountNumberEncrypted = professionalProfile.PayoutAccountNumberEncrypted!,
                    BankName = professionalProfile.PayoutBankName,
                    OpenProfessionalProfileId = professionalProfile.Id
                };
                _context.PayoutRequests.Add(payoutRequest);
                await _context.SaveChangesAsync();

                var affectedBookings = await GetAvailableBookingsQuery(
                        eligibleBefore)
                    .Where(booking => booking.ProfessionalProfileId == professionalProfile.Id)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(booking => booking.PayoutRequestId, payoutRequest.Id));
                if (affectedBookings != eligible.Count)
                {
                    await transaction.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    return PayoutOperationResult<PayoutRequestSummaryDto>.Failure(
                        "Available bookings changed while the payout was being requested. Try again.",
                        PayoutErrorCode.Conflict);
                }

                await transaction.CommitAsync();
                return PayoutOperationResult<PayoutRequestSummaryDto>.Success(
                    ToProfessionalRequest(payoutRequest));
            });

            return result;
        }
        catch (DbUpdateException)
        {
            _context.ChangeTracker.Clear();
            var hasOpenRequest = await _context.PayoutRequests
                .AnyAsync(request => request.OpenProfessionalProfileId == professionalProfile.Id);
            if (hasOpenRequest)
            {
                return PayoutOperationResult<PayoutRequestSummaryDto>.Failure(
                    "A payout request is already in progress.",
                    PayoutErrorCode.Conflict);
            }

            throw;
        }
    }

    public async Task<List<PayoutRequestSummaryDto>?> GetMyRequestsAsync(int professionalUserId)
    {
        var professionalProfileId = await GetProfessionalProfileIdAsync(professionalUserId);
        if (!professionalProfileId.HasValue)
        {
            return null;
        }

        var requests = await _context.PayoutRequests
            .AsNoTracking()
            .Where(request => request.ProfessionalProfileId == professionalProfileId.Value)
            .OrderByDescending(request => request.RequestedAt)
            .ToListAsync();
        return requests.Select(ToProfessionalRequest).ToList();
    }

    public async Task<List<AdminPayoutRequestDto>> ListQueueAsync()
    {
        var requests = await GetAdminRequestsQuery()
            .Where(request => request.Status == PayoutRequestStatus.Requested)
            .OrderBy(request => request.RequestedAt)
            .ToListAsync();
        return requests.Select(ToAdminRequest).ToList();
    }

    public async Task<List<AdminPayoutRequestDto>> ListHistoryAsync()
    {
        var requests = await GetAdminRequestsQuery()
            .Where(request => request.Status != PayoutRequestStatus.Requested)
            .OrderByDescending(request => request.ProcessedAt)
            .ToListAsync();
        return requests.Select(ToAdminRequest).ToList();
    }

    public async Task<List<AdminProfessionalPayoutBalanceDto>> ListProfessionalBalancesAsync()
    {
        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var availableBefore = now.AddHours(-_options.HoldHours);
        var profiles = await _context.ProfessionalProfiles
            .AsNoTracking()
            .Select(profile => new
            {
                profile.Id,
                profile.BusinessName,
                profile.User.Email,
                profile.AvatarUrl
            })
            .OrderBy(profile => profile.BusinessName)
            .ToListAsync();

        var pendingRows = await GetPendingBookingsQuery(availableBefore)
            .Select(booking => new { booking.ProfessionalProfileId, booking.ProfessionalPayoutAmount })
            .ToListAsync();
        var pending = GroupMoneyTotals(
            pendingRows,
            row => row.ProfessionalProfileId,
            row => row.ProfessionalPayoutAmount);
        var availableRows = await GetAvailableBookingsQuery(availableBefore)
            .Select(booking => new { booking.ProfessionalProfileId, booking.ProfessionalPayoutAmount })
            .ToListAsync();
        var available = GroupMoneyTotals(
            availableRows,
            row => row.ProfessionalProfileId,
            row => row.ProfessionalPayoutAmount);
        var requestedRows = await _context.PayoutRequests
            .Where(request => request.Status == PayoutRequestStatus.Requested)
            .Select(request => new { request.ProfessionalProfileId, request.Amount })
            .ToListAsync();
        var requested = GroupMoneyTotals(
            requestedRows,
            row => row.ProfessionalProfileId,
            row => row.Amount);
        var paidOutRows = await _context.PayoutRequests
            .Where(request => request.Status == PayoutRequestStatus.Paid)
            .Select(request => new { request.ProfessionalProfileId, request.Amount })
            .ToListAsync();
        var paidOut = GroupMoneyTotals(
            paidOutRows,
            row => row.ProfessionalProfileId,
            row => row.Amount);
        var customerPaymentRows = await _context.Bookings
            .Where(booking =>
                booking.EsewaTransactionCode != null
                && booking.EsewaTotalAmount.HasValue)
            .Select(booking => new { booking.ProfessionalProfileId, Amount = booking.EsewaTotalAmount!.Value })
            .ToListAsync();
        var customerPayments = GroupMoneyTotals(
            customerPaymentRows,
            row => row.ProfessionalProfileId,
            row => row.Amount);
        var commissionRows = await _context.Bookings
            .Where(booking => booking.Status == BookingStatus.Completed)
            .Select(booking => new { booking.ProfessionalProfileId, booking.CommissionAmount })
            .ToListAsync();
        var commissions = GroupMoneyTotals(
            commissionRows,
            row => row.ProfessionalProfileId,
            row => row.CommissionAmount);

        return profiles.Select(profile => new AdminProfessionalPayoutBalanceDto(
                profile.Id,
                profile.BusinessName,
                profile.Email,
                profile.AvatarUrl,
                customerPayments.GetValueOrDefault(profile.Id),
                commissions.GetValueOrDefault(profile.Id),
                pending.GetValueOrDefault(profile.Id),
                available.GetValueOrDefault(profile.Id),
                requested.GetValueOrDefault(profile.Id),
                paidOut.GetValueOrDefault(profile.Id)))
            .ToList();
    }

    public Task<PayoutOperationResult<AdminPayoutRequestDto>> MarkPaidAsync(
        int requestId,
        int adminUserId,
        MarkPayoutPaidDto request) =>
        ProcessRequestAsync(requestId, adminUserId, request);

    public Task<PayoutOperationResult<AdminPayoutRequestDto>> RejectAsync(
        int requestId,
        int adminUserId,
        RejectPayoutDto request) =>
        RejectRequestAsync(requestId, adminUserId, request);

    private async Task<PayoutOperationResult<AdminPayoutRequestDto>> ProcessRequestAsync(
        int requestId,
        int adminUserId,
        MarkPayoutPaidDto request)
    {
        var reference = request.Reference?.Trim();
        if (string.IsNullOrEmpty(reference))
        {
            return PayoutOperationResult<AdminPayoutRequestDto>.Failure(
                "A payment reference is required.",
                PayoutErrorCode.InvalidRequest);
        }

        if (reference.Length is < 1 or > 200)
        {
            return PayoutOperationResult<AdminPayoutRequestDto>.Failure(
                "A payment reference is required.",
                PayoutErrorCode.InvalidRequest);
        }

        var notes = request.Notes?.Trim();
        var executionStrategy = _context.Database.CreateExecutionStrategy();
        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);
            var now = _timeProvider.GetUtcNow().UtcDateTime;
            var affected = await _context.PayoutRequests
                .Where(item => item.Id == requestId && item.Status == PayoutRequestStatus.Requested)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(item => item.Status, PayoutRequestStatus.Paid)
                    .SetProperty(item => item.ProcessedAt, now)
                    .SetProperty(item => item.ProcessedByAdminUserId, adminUserId)
                    .SetProperty(item => item.Reference, reference)
                    .SetProperty(item => item.Notes, notes)
                    .SetProperty(item => item.OpenProfessionalProfileId, (int?)null));
            if (affected == 0)
            {
                await transaction.RollbackAsync();
                return await GetProcessingFailureAsync(requestId);
            }

            await transaction.CommitAsync();
            var updated = await GetAdminRequestsQuery().FirstAsync(item => item.Id == requestId);
            return PayoutOperationResult<AdminPayoutRequestDto>.Success(ToAdminRequest(updated));
        });
    }

    private async Task<PayoutOperationResult<AdminPayoutRequestDto>> RejectRequestAsync(
        int requestId,
        int adminUserId,
        RejectPayoutDto request)
    {
        var reason = request.Reason.Trim();
        if (reason.Length is < 3 or > 1000)
        {
            return PayoutOperationResult<AdminPayoutRequestDto>.Failure(
                "Rejection reason must contain 3 to 1000 characters.",
                PayoutErrorCode.InvalidRequest);
        }

        var executionStrategy = _context.Database.CreateExecutionStrategy();
        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);
            var now = _timeProvider.GetUtcNow().UtcDateTime;
            var affected = await _context.PayoutRequests
                .Where(item => item.Id == requestId && item.Status == PayoutRequestStatus.Requested)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(item => item.Status, PayoutRequestStatus.Rejected)
                    .SetProperty(item => item.ProcessedAt, now)
                    .SetProperty(item => item.ProcessedByAdminUserId, adminUserId)
                    .SetProperty(item => item.RejectionReason, reason)
                    .SetProperty(item => item.OpenProfessionalProfileId, (int?)null));
            if (affected == 0)
            {
                await transaction.RollbackAsync();
                return await GetProcessingFailureAsync(requestId);
            }

            await _context.Bookings
                .Where(booking => booking.PayoutRequestId == requestId)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(booking => booking.PayoutRequestId, (int?)null));
            await transaction.CommitAsync();
            var updated = await GetAdminRequestsQuery().FirstAsync(item => item.Id == requestId);
            return PayoutOperationResult<AdminPayoutRequestDto>.Success(ToAdminRequest(updated));
        });
    }

    private async Task<PayoutOperationResult<AdminPayoutRequestDto>> GetProcessingFailureAsync(int requestId)
    {
        var exists = await _context.PayoutRequests.AnyAsync(item => item.Id == requestId);
        return PayoutOperationResult<AdminPayoutRequestDto>.Failure(
            exists ? "Payout request is no longer awaiting review." : "Payout request not found.",
            exists ? PayoutErrorCode.Conflict : PayoutErrorCode.NotFound);
    }

    private IQueryable<Booking> GetPendingBookingsQuery(DateTime eligibleBefore)
    {
        return _context.Bookings.Where(booking =>
            booking.RefundStatus == RefundStatus.NotRequested
            && booking.PayoutRequestId == null
            && (booking.Status == BookingStatus.Confirmed
                || (booking.Status == BookingStatus.Completed
                    && (!booking.CompletedAt.HasValue
                        || booking.CompletedAt.Value > eligibleBefore
                        || (booking.Dispute != null
                            && (booking.Dispute.Status == DisputeStatus.Open
                                || booking.Dispute.Status == DisputeStatus.UnderReview))))));
    }

    private IQueryable<Booking> GetAvailableBookingsQuery(DateTime eligibleBefore)
    {
        return _context.Bookings.Where(booking =>
            booking.Status == BookingStatus.Completed
            && booking.CompletedAt.HasValue
            && booking.CompletedAt.Value <= eligibleBefore
            && booking.RefundStatus == RefundStatus.NotRequested
            && booking.PayoutRequestId == null
            && (booking.Dispute == null
                || (booking.Dispute.Status != DisputeStatus.Open
                    && booking.Dispute.Status != DisputeStatus.UnderReview)));
    }

    private IQueryable<PayoutRequest> GetAdminRequestsQuery()
    {
        return _context.PayoutRequests
            .AsNoTracking()
            .Include(request => request.ProfessionalProfile)
                .ThenInclude(profile => profile.User);
    }

    private async Task<int?> GetProfessionalProfileIdAsync(int professionalUserId) =>
        await _context.ProfessionalProfiles
            .Where(profile => profile.UserId == professionalUserId)
            .Select(profile => (int?)profile.Id)
            .FirstOrDefaultAsync();

    private static Dictionary<int, decimal> GroupMoneyTotals<T>(
        IEnumerable<T> rows,
        Func<T, int> professionalProfileId,
        Func<T, decimal> amount) =>
        rows.GroupBy(professionalProfileId)
            .ToDictionary(group => group.Key, group => group.Sum(amount));

    private PayoutDetailsDto ToPayoutDetails(ProfessionalProfile profile)
    {
        var maskedAccountNumber = string.IsNullOrWhiteSpace(profile.PayoutAccountNumberEncrypted)
            ? null
            : _protector.Mask(_protector.Unprotect(profile.PayoutAccountNumberEncrypted));
        return new PayoutDetailsDto(
            profile.PayoutMethod,
            profile.PayoutAccountName,
            maskedAccountNumber,
            profile.PayoutBankName);
    }

    private PayoutRequestSummaryDto ToProfessionalRequest(PayoutRequest request)
    {
        var accountNumber = _protector.Unprotect(request.AccountNumberEncrypted);
        return new PayoutRequestSummaryDto(
            request.Id,
            request.Amount,
            request.Status.ToString(),
            request.RequestedAt,
            request.ProcessedAt,
            request.PayoutMethod,
            _protector.Mask(accountNumber),
            request.Reference,
            request.RejectionReason,
            request.Notes);
    }

    private AdminPayoutRequestDto ToAdminRequest(PayoutRequest request) =>
        new(
            request.Id,
            request.ProfessionalProfileId,
            request.ProfessionalProfile.BusinessName,
            request.ProfessionalProfile.User.Email,
            request.ProfessionalProfile.AvatarUrl,
            request.Amount,
            request.Status.ToString(),
            request.RequestedAt,
            request.ProcessedAt,
            request.PayoutMethod,
            request.AccountName,
            _protector.Unprotect(request.AccountNumberEncrypted),
            request.BankName,
            request.Reference,
            request.RejectionReason,
            request.Notes);
}
