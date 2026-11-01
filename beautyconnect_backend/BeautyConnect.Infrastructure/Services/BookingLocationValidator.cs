using System.Text.RegularExpressions;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Infrastructure.Configuration;

namespace BeautyConnect.Infrastructure.Services;

public static partial class BookingLocationValidator
{
    [GeneratedRegex(@"^\+?[0-9][0-9\s().-]{6,28}$", RegexOptions.CultureInvariant)]
    private static partial Regex PhonePattern();

    public static string? ValidateCustomerLocation(
        PaymentLocationDto? location,
        LocationBoundsOptions bounds)
    {
        if (location == null)
        {
            return "A service location is required.";
        }

        if (string.IsNullOrWhiteSpace(location.AddressLine))
        {
            return "Enter the address where the service will take place.";
        }

        if (location.AddressLine.Trim().Length > 300)
        {
            return "The address must be 300 characters or fewer.";
        }

        if (string.IsNullOrWhiteSpace(location.City))
        {
            return "Enter the city where the service will take place.";
        }

        if (location.City.Trim().Length > 100)
        {
            return "The city must be 100 characters or fewer.";
        }

        if (location.Landmark?.Trim().Length > 500)
        {
            return "Landmark or arrival directions must be 500 characters or fewer.";
        }

        if (string.IsNullOrWhiteSpace(location.ContactPhone))
        {
            return "Enter a contact phone number for the appointment.";
        }

        var phone = location.ContactPhone.Trim();
        var digitCount = phone.Count(char.IsDigit);
        if (phone.Length > 30 || digitCount is < 7 or > 15 || !PhonePattern().IsMatch(phone))
        {
            return "Enter a valid contact phone number.";
        }

        return ValidateCoordinates(location.Latitude, location.Longitude, bounds);
    }

    public static string? ValidateCoordinates(
        double? latitude,
        double? longitude,
        LocationBoundsOptions bounds)
    {
        if (!latitude.HasValue || !longitude.HasValue
            || !double.IsFinite(latitude.Value)
            || !double.IsFinite(longitude.Value)
            || latitude.Value is < -90 or > 90
            || longitude.Value is < -180 or > 180)
        {
            return "Choose a valid map location with latitude between -90 and 90 and longitude between -180 and 180.";
        }

        if (latitude.Value == 0 && longitude.Value == 0)
        {
            return "Choose a map location other than (0, 0).";
        }

        if (bounds.Enabled
            && (latitude.Value < bounds.MinLatitude
                || latitude.Value > bounds.MaxLatitude
                || longitude.Value < bounds.MinLongitude
                || longitude.Value > bounds.MaxLongitude))
        {
            return $"Choose a location within Nepal (latitude {bounds.MinLatitude} to {bounds.MaxLatitude}, longitude {bounds.MinLongitude} to {bounds.MaxLongitude}).";
        }

        return null;
    }
}
