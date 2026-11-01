using BeautyConnect.Core.DTOs;
using BeautyConnect.Infrastructure.Configuration;
using BeautyConnect.Infrastructure.Services;
using Xunit;

namespace BeautyConnect.Tests;

public class BookingLocationValidatorTests
{
    private static LocationBoundsOptions NepalBounds => new();

    [Fact]
    public void ValidCustomerLocationIsAccepted()
    {
        var error = BookingLocationValidator.ValidateCustomerLocation(
            new PaymentLocationDto
            {
                AddressLine = "Thamel, Kathmandu",
                City = "Kathmandu",
                Latitude = 27.7172,
                Longitude = 85.3240,
                ContactPhone = "+977 9812345678"
            },
            NepalBounds);

        Assert.Null(error);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(91, 85)]
    [InlineData(27, 181)]
    [InlineData(25, 85)]
    [InlineData(27, 89)]
    public void InvalidCoordinatesAreRejected(double latitude, double longitude)
    {
        var error = BookingLocationValidator.ValidateCustomerLocation(
            ValidCustomerLocation(latitude, longitude),
            NepalBounds);

        Assert.NotNull(error);
    }

    [Theory]
    [InlineData("", "Kathmandu", "Enter the address")]
    [InlineData("Thamel", "", "Enter the city")]
    [InlineData("Thamel", "Kathmandu", "valid contact phone")]
    public void RequiredAddressCityAndPhoneAreValidated(
        string address,
        string city,
        string expectedMessage)
    {
        var location = ValidCustomerLocation(27.7172, 85.3240);
        location.AddressLine = address;
        location.City = city;
        if (expectedMessage.Contains("phone", StringComparison.OrdinalIgnoreCase))
        {
            location.ContactPhone = "bad";
        }

        var error = BookingLocationValidator.ValidateCustomerLocation(location, NepalBounds);

        Assert.Contains(expectedMessage, error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void LocationOutsideOptionalBoundsCanBeAllowed()
    {
        var bounds = new LocationBoundsOptions { Enabled = false };

        var error = BookingLocationValidator.ValidateCustomerLocation(
            ValidCustomerLocation(40, -74),
            bounds);

        Assert.Null(error);
    }

    private static PaymentLocationDto ValidCustomerLocation(double latitude, double longitude) => new()
    {
        AddressLine = "Thamel",
        City = "Kathmandu",
        Latitude = latitude,
        Longitude = longitude,
        ContactPhone = "+977 9812345678"
    };
}
