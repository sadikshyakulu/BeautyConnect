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
            new BookingLocationDto
            {
                AddressLine = "  Thamel, Kathmandu  ",
                City = "Kathmandu",
                Latitude = 27.7172,
                Longitude = 85.3240,
                ContactPhone = "+977 9812345678"
            },
            NepalBounds);

        Assert.Null(error);
    }

    [Theory]
    [InlineData(91, 85)]
    [InlineData(27, 181)]
    public void OutOfRangeCoordinatesAreRejected(double latitude, double longitude)
    {
        var error = BookingLocationValidator.ValidateCustomerLocation(
            ValidLocation(latitude, longitude),
            NepalBounds);

        Assert.NotNull(error);
    }

    [Fact]
    public void ZeroZeroCoordinatesAreRejected()
    {
        var error = BookingLocationValidator.ValidateCustomerLocation(
            ValidLocation(0, 0),
            NepalBounds);

        Assert.Contains("(0, 0)", error);
    }

    [Theory]
    [InlineData(25, 85)]
    [InlineData(27, 89)]
    public void CoordinatesOutsideConfiguredBoundsAreRejected(double latitude, double longitude)
    {
        var error = BookingLocationValidator.ValidateCustomerLocation(
            ValidLocation(latitude, longitude),
            NepalBounds);
        Assert.Contains("within Nepal", error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void InvalidPhoneIsRejected()
    {
        var location = ValidLocation(27.7172, 85.3240);
        location.ContactPhone = "(981) 234-5678";

        var error = BookingLocationValidator.ValidateCustomerLocation(
            location,
            NepalBounds);

        Assert.Contains("valid contact phone", error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void MissingAddressIsRejected()
    {
        var location = ValidLocation(27.7172, 85.3240);
        location.AddressLine = "   ";

        var error = BookingLocationValidator.ValidateCustomerLocation(location, NepalBounds);

        Assert.Contains("address", error, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void LocationTextIsTrimmedBeforePersistence()
    {
        var location = ValidLocation(27.7172, 85.3240);
        location.AddressLine = "  Thamel  ";
        location.City = "  Kathmandu  ";
        location.Landmark = "  Near the square  ";
        location.ContactPhone = "  +977 9812345678  ";

        var error = BookingLocationValidator.ValidateCustomerLocation(location, NepalBounds);

        Assert.Null(error);
        Assert.Equal("Thamel", location.AddressLine);
        Assert.Equal("Kathmandu", location.City);
        Assert.Equal("Near the square", location.Landmark);
        Assert.Equal("+977 9812345678", location.ContactPhone);
    }

    private static BookingLocationDto ValidLocation(double latitude, double longitude) => new()
    {
        AddressLine = "Thamel",
        City = "Kathmandu",
        Latitude = latitude,
        Longitude = longitude,
        ContactPhone = "+977 9812345678"
    };
}
