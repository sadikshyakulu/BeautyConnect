using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Infrastructure.Configuration;
using BeautyConnect.Infrastructure.Data;
using BeautyConnect.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace BeautyConnect.Tests;

public class PaymentPayoutTests
{
    [Fact]
    public async Task InitiationChargesServicePriceAndStoresCommissionAndPayoutSeparately()
    {
        var options = new DbContextOptionsBuilder<BeautyConnectDbContext>()
            .UseSqlite("Data Source=:memory:")
            .Options;
        await using var context = new BeautyConnectDbContext(options);
        await context.Database.OpenConnectionAsync();
        await context.Database.EnsureCreatedAsync();

        var customerUser = new User
        {
            Email = "customer@example.com",
            PasswordHash = "not-used",
            Role = UserRole.Customer
        };
        var customer = new CustomerProfile
        {
            User = customerUser,
            FullName = "Test Customer"
        };
        var professionalUser = new User
        {
            Email = "professional@example.com",
            PasswordHash = "not-used",
            Role = UserRole.Professional
        };
        var professional = new ProfessionalProfile
        {
            User = professionalUser,
            BusinessName = "Test Studio",
            VerificationStatus = VerificationStatus.Approved
        };
        var service = new Service
        {
            ProfessionalProfile = professional,
            Name = "Test Service",
            Description = "Test service description",
            Category = "Beauty",
            Price = 3500m,
            DurationMinutes = 60
        };

        var localStart = DateTime.UtcNow.Date.AddDays(3).AddHours(10);
        var scheduleStart = BookingScheduleValidator.ToNepalDateTimeOffset(localStart);
        context.AddRange(customer, professional, service);
        context.Availabilities.Add(new Availability
        {
            ProfessionalProfile = professional,
            SpecificDate = DateOnly.FromDateTime(localStart),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(15, 0)
        });
        await context.SaveChangesAsync();

        var paymentService = new PaymentService(
            context,
            new HttpClient(),
            Options.Create(new EsewaOptions
            {
                ProductCode = "EPAYTEST",
                SecretKey = "test-secret",
                FormUrl = "https://example.test/payment",
                StatusCheckUrl = "https://example.test/status",
                SuccessUrl = "https://example.test/success",
                FailureUrl = "https://example.test/failure",
                CommissionRate = 0.05m
            }),
            Options.Create(new LocationBoundsOptions()),
            NullLogger<PaymentService>.Instance);

        var result = await paymentService.InitiatePaymentAsync(
            customerUser.Id,
            new PaymentInitiateDto
            {
                ServiceId = service.Id,
                ScheduledDateTime = scheduleStart,
                Location = new BookingLocationDto
                {
                    AddressLine = "Thamel",
                    City = "Kathmandu",
                    Latitude = 27.7172,
                    Longitude = 85.3240,
                    ContactPhone = "+977 9812345678"
                }
            },
            CancellationToken.None);

        Assert.NotNull(result.Value);
        Assert.Equal("3500", result.Value.Amount);
        Assert.Equal("3500", result.Value.TotalAmount);
        Assert.Equal("0.00", result.Value.ProductServiceCharge);
        Assert.Equal(0m, decimal.Parse(result.Value.TaxAmount));
        Assert.Equal(0m, decimal.Parse(result.Value.ProductDeliveryCharge));
        Assert.Equal(
            decimal.Parse(result.Value.TotalAmount),
            decimal.Parse(result.Value.Amount)
                + decimal.Parse(result.Value.TaxAmount)
                + decimal.Parse(result.Value.ProductServiceCharge)
                + decimal.Parse(result.Value.ProductDeliveryCharge));

        var intent = await context.PaymentIntents.SingleAsync();
        Assert.Equal(3500m, intent.EsewaTotalAmount);
        Assert.Equal(175m, intent.CommissionAmount);
        Assert.Equal(3325m, intent.ProfessionalPayoutAmount);
    }
}
