using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Configuration;
using BeautyConnect.Infrastructure.Data;
using BeautyConnect.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using Xunit;

namespace BeautyConnect.Tests;

public class PayoutServiceTests
{
    [Fact]
    public async Task PayoutRequestAppliesHoldDisputeAndRefundRules()
    {
        await using var fixture = await TestFixture.CreateAsync();
        fixture.AddBooking(100m, BookingStatus.Completed, fixture.Now.AddHours(-25));
        fixture.AddBooking(200m, BookingStatus.Completed, fixture.Now.AddHours(-23));
        fixture.AddBooking(
            300m,
            BookingStatus.Completed,
            fixture.Now.AddHours(-30),
            disputeStatus: DisputeStatus.Open);
        fixture.AddBooking(
            400m,
            BookingStatus.Completed,
            fixture.Now.AddHours(-30),
            disputeStatus: DisputeStatus.UnderReview);
        fixture.AddBooking(
            500m,
            BookingStatus.Completed,
            fixture.Now.AddHours(-30),
            refundStatus: RefundStatus.Refunded);
        fixture.AddBooking(600m, BookingStatus.Cancelled, fixture.Now.AddHours(-30));
        fixture.AddBooking(700m, BookingStatus.Confirmed, fixture.Now.AddHours(-30));
        await fixture.Context.SaveChangesAsync();

        var result = await fixture.CreateService(fixture.Context, minimumAmount: 50m)
            .RequestPayoutAsync(fixture.ProfessionalUser.Id);

        Assert.NotNull(result.Value);
        Assert.Equal(100m, result.Value.Amount);
        fixture.Context.ChangeTracker.Clear();
        var linkedBookings = await fixture.Context.Bookings
            .Where(booking => booking.PayoutRequestId == result.Value.Id)
            .ToListAsync();
        Assert.Single(linkedBookings);
        Assert.Equal(100m, linkedBookings[0].ProfessionalPayoutAmount);
    }

    [Fact]
    public async Task PayoutDetailsAreStoredProtectedAndReturnedMasked()
    {
        await using var fixture = await TestFixture.CreateAsync();
        var service = fixture.CreateService(fixture.Context);

        var result = await service.UpdatePayoutDetailsAsync(
            fixture.ProfessionalUser.Id,
            new()
            {
                PayoutMethod = "eSewa",
                AccountName = "Studio Owner",
                AccountNumber = "9812345678"
            });

        Assert.NotNull(result.Value);
        Assert.Equal("**** 5678", result.Value.MaskedAccountNumber);
        Assert.Equal("protected:9812345678", fixture.ProfessionalProfile.PayoutAccountNumberEncrypted);

        var invalidMethod = await service.UpdatePayoutDetailsAsync(
            fixture.ProfessionalUser.Id,
            new()
            {
                PayoutMethod = "Unknown",
                AccountName = "Studio Owner",
                AccountNumber = "9812345678"
            });
        Assert.Equal(PayoutErrorCode.InvalidRequest, invalidMethod.ErrorCode);
    }

    [Theory]
    [InlineData("eSewa", "9812345678", null, true)]
    [InlineData("eSewa", "1234567890", null, false)]
    [InlineData("Bank", "123456", "Bank of Nepal", true)]
    [InlineData("Bank", "12AB56", "Bank of Nepal", false)]
    [InlineData("Bank", "123456", null, false)]
    public void PayoutDetailsValidateMethodAndAccountFormat(
        string method,
        string accountNumber,
        string? bankName,
        bool expectedValid)
    {
        var request = new PayoutDetailsUpdateDto
        {
            PayoutMethod = method,
            AccountName = "Studio Owner",
            AccountNumber = accountNumber,
            BankName = bankName
        };
        var errors = new List<ValidationResult>();
        Validator.TryValidateObject(
            request,
            new ValidationContext(request),
            errors,
            validateAllProperties: true);

        Assert.Equal(expectedValid, errors.Count == 0);
    }

    [Fact]
    public async Task RequestPayoutLinksWholeAvailableBalanceAndRejectsSecondOpenRequest()
    {
        await using var fixture = await TestFixture.CreateAsync();
        fixture.AddBooking(325m, BookingStatus.Completed, fixture.Now.AddHours(-25));
        fixture.AddBooking(200m, BookingStatus.Completed, fixture.Now.AddHours(-26));
        await fixture.Context.SaveChangesAsync();
        var service = fixture.CreateService(fixture.Context);

        var firstRequest = await service.RequestPayoutAsync(fixture.ProfessionalUser.Id);
        var secondRequest = await service.RequestPayoutAsync(fixture.ProfessionalUser.Id);

        Assert.NotNull(firstRequest.Value);
        Assert.Equal(525m, firstRequest.Value.Amount);
        Assert.Equal(PayoutRequestStatus.Requested.ToString(), firstRequest.Value.Status);
        Assert.Equal(PayoutErrorCode.Conflict, secondRequest.ErrorCode);
        Assert.Equal(1, await fixture.Context.PayoutRequests.CountAsync());
        fixture.Context.ChangeTracker.Clear();
        Assert.All(
            await fixture.Context.Bookings.ToListAsync(),
            booking => Assert.Equal(firstRequest.Value.Id, booking.PayoutRequestId));
    }

    [Fact]
    public async Task ConcurrentPayoutRequestsCreateAtMostOneOpenRequest()
    {
        await using var fixture = await TestFixture.CreateAsync();
        fixture.AddBooking(750m, BookingStatus.Completed, fixture.Now.AddHours(-25));
        await fixture.Context.SaveChangesAsync();

        await using var firstContext = fixture.CreateContext();
        await using var secondContext = fixture.CreateContext();
        var firstService = fixture.CreateService(firstContext);
        var secondService = fixture.CreateService(secondContext);

        var results = await Task.WhenAll(
            firstService.RequestPayoutAsync(fixture.ProfessionalUser.Id),
            secondService.RequestPayoutAsync(fixture.ProfessionalUser.Id));

        Assert.Single(results, result => result.Value != null);
        Assert.Single(results, result => result.ErrorCode == PayoutErrorCode.Conflict);
        Assert.Equal(1, await fixture.Context.PayoutRequests
            .CountAsync(request => request.Status == PayoutRequestStatus.Requested));
    }

    [Fact]
    public async Task MarkPaidPreventsAnotherPaymentAndRejectRestoresAvailableBalance()
    {
        await using var fixture = await TestFixture.CreateAsync();
        fixture.AddBooking(800m, BookingStatus.Completed, fixture.Now.AddHours(-25));
        await fixture.Context.SaveChangesAsync();
        var service = fixture.CreateService(fixture.Context);
        var created = await service.RequestPayoutAsync(fixture.ProfessionalUser.Id);
        Assert.NotNull(created.Value);

        var paid = await service.MarkPaidAsync(
            created.Value.Id,
            fixture.AdminUser.Id,
            new() { Reference = "transfer-123" });
        var paidAgain = await service.MarkPaidAsync(
            created.Value.Id,
            fixture.AdminUser.Id,
            new() { Reference = "transfer-456" });

        Assert.Equal(PayoutRequestStatus.Paid.ToString(), paid.Value!.Status);
        Assert.Equal("transfer-123", paid.Value.Reference);
        Assert.Equal(PayoutErrorCode.Conflict, paidAgain.ErrorCode);
        var duplicatePayout = await service.RequestPayoutAsync(fixture.ProfessionalUser.Id);
        Assert.Equal(PayoutErrorCode.Conflict, duplicatePayout.ErrorCode);
        Assert.Equal(
            1,
            await fixture.Context.PayoutRequests.CountAsync(
                request => request.Status == PayoutRequestStatus.Paid));

        fixture.AddBooking(900m, BookingStatus.Completed, fixture.Now.AddHours(-25));
        await fixture.Context.SaveChangesAsync();
        var rejectedRequest = await service.RequestPayoutAsync(fixture.ProfessionalUser.Id);
        Assert.NotNull(rejectedRequest.Value);

        var rejected = await service.RejectAsync(
            rejectedRequest.Value.Id,
            fixture.AdminUser.Id,
            new() { Reason = "Incorrect payout account." });

        Assert.Equal(PayoutRequestStatus.Rejected.ToString(), rejected.Value!.Status);
        var availableAgain = await service.RequestPayoutAsync(fixture.ProfessionalUser.Id);
        Assert.NotNull(availableAgain.Value);
        Assert.Equal(900m, availableAgain.Value.Amount);
    }

    private sealed class TestFixture : IAsyncDisposable
    {
        private readonly SqliteConnection _anchorConnection;
        private readonly string _connectionString;

        private TestFixture(SqliteConnection anchorConnection, string connectionString)
        {
            _anchorConnection = anchorConnection;
            _connectionString = connectionString;
        }

        public BeautyConnectDbContext Context { get; private set; } = null!;
        public User ProfessionalUser { get; private set; } = null!;
        public ProfessionalProfile ProfessionalProfile { get; private set; } = null!;
        public User CustomerUser { get; private set; } = null!;
        public CustomerProfile CustomerProfile { get; private set; } = null!;
        public Service Service { get; private set; } = null!;
        public User AdminUser { get; private set; } = null!;
        public DateTime Now { get; } = new(2026, 11, 2, 12, 0, 0, DateTimeKind.Utc);

        public static async Task<TestFixture> CreateAsync()
        {
            var name = $"payout-tests-{Guid.NewGuid():N}";
            var connectionString = $"Data Source={name};Mode=Memory;Cache=Shared";
            var anchor = new SqliteConnection(connectionString);
            await anchor.OpenAsync();
            var fixture = new TestFixture(anchor, connectionString)
            {
                Context = new BeautyConnectDbContext(CreateOptions(connectionString))
            };
            await fixture.Context.Database.EnsureCreatedAsync();
            await fixture.SeedCoreAsync();
            return fixture;
        }

        public BeautyConnectDbContext CreateContext() =>
            new(CreateOptions(_connectionString));

        public PayoutService CreateService(
            BeautyConnectDbContext context,
            decimal minimumAmount = 500m) =>
            new(
                context,
                new TestPayoutDetailsProtector(),
                Options.Create(new PayoutOptions { MinimumAmount = minimumAmount, HoldHours = 24 }),
                new FixedTimeProvider(new DateTimeOffset(Now)));

        public Booking AddBooking(
            decimal amount,
            BookingStatus status,
            DateTime completedAt,
            RefundStatus refundStatus = RefundStatus.NotRequested,
            DisputeStatus? disputeStatus = null)
        {
            var booking = new Booking
            {
                CustomerProfile = CustomerProfile,
                ProfessionalProfile = ProfessionalProfile,
                Service = Service,
                ScheduledDateTime = completedAt.AddDays(-1),
                EndDateTime = completedAt.AddDays(-1).AddHours(1),
                Status = status,
                TotalPrice = amount,
                CommissionAmount = 0m,
                ProfessionalPayoutAmount = amount,
                CompletedAt = completedAt,
                RefundStatus = refundStatus,
                CreatedAt = completedAt.AddDays(-2)
            };
            if (disputeStatus.HasValue)
            {
                booking.Dispute = new Dispute
                {
                    RaisedByUser = CustomerUser,
                    Reason = "Test dispute",
                    Status = disputeStatus.Value
                };
            }

            Context.Bookings.Add(booking);
            return booking;
        }

        public async ValueTask DisposeAsync()
        {
            await Context.DisposeAsync();
            await _anchorConnection.DisposeAsync();
        }

        private async Task SeedCoreAsync()
        {
            ProfessionalUser = new User
            {
                Email = "professional@example.com",
                PasswordHash = "not-used",
                Role = UserRole.Professional
            };
            CustomerUser = new User
            {
                Email = "customer@example.com",
                PasswordHash = "not-used",
                Role = UserRole.Customer
            };
            AdminUser = new User
            {
                Email = "admin@example.com",
                PasswordHash = "not-used",
                Role = UserRole.Admin
            };
            ProfessionalProfile = new ProfessionalProfile
            {
                User = ProfessionalUser,
                BusinessName = "Test Studio",
                PayoutMethod = "eSewa",
                PayoutAccountName = "Studio Owner",
                PayoutAccountNumberEncrypted = new TestPayoutDetailsProtector().Protect("9812345678")
            };
            CustomerProfile = new CustomerProfile
            {
                User = CustomerUser,
                FullName = "Test Customer"
            };
            Service = new Service
            {
                ProfessionalProfile = ProfessionalProfile,
                Name = "Test Service",
                Description = "Test service description",
                Category = "Beauty",
                Price = 1000m
            };
            Context.AddRange(ProfessionalProfile, CustomerProfile, AdminUser, Service);
            await Context.SaveChangesAsync();
        }

        private static DbContextOptions<BeautyConnectDbContext> CreateOptions(string connectionString) =>
            new DbContextOptionsBuilder<BeautyConnectDbContext>()
                .UseSqlite(connectionString)
                .Options;
    }

    private sealed class TestPayoutDetailsProtector : IPayoutDetailsProtector
    {
        public string Protect(string accountNumber) => $"protected:{accountNumber}";

        public string Unprotect(string protectedAccountNumber) =>
            protectedAccountNumber["protected:".Length..];

        public string Mask(string accountNumber) =>
            $"**** {accountNumber[^4..]}";
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        private readonly DateTimeOffset _now;

        public FixedTimeProvider(DateTimeOffset now)
        {
            _now = now;
        }

        public override DateTimeOffset GetUtcNow() => _now;
    }
}
