using System.Text.RegularExpressions;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Infrastructure.Configuration;

namespace BeautyConnect.Infrastructure.Services;

public static partial class BookingLocationValidator
{
    [GeneratedRegex(@"^[0-9 +-]+$", RegexOptions.CultureInvariant)]
    private static partial Regex PhonePattern();

    public static string? ValidateCustomerLocation(
        BookingLocationDto? location,
        LocationBoundsOptions bounds)
    {
        if (location == null)
        {
            return "A service location is required.";
        }

        var addressLine = location.AddressLine?.Trim();
        if (string.IsNullOrWhiteSpace(addressLine) || addressLine.Length is < 5 or > 300)
        {
            return "Enter an address between 5 and 300 characters.";
        }

        var city = location.City?.Trim();
        if (string.IsNullOrWhiteSpace(city) || city.Length is < 2 or > 100)
        {
            return "Enter a city between 2 and 100 characters.";
        }

        if (location.Landmark?.Trim().Length > 500)
        {
            return "Landmark or arrival directions must be 500 characters or fewer.";
        }

        var phone = location.ContactPhone?.Trim();
        if (string.IsNullOrWhiteSpace(phone))
        {
            return "Enter a contact phone number for the appointment.";
        }

        var digitCount = phone.Count(character => character is >= '0' and <= '9');
        if (phone.Length > 30 || digitCount is < 7 or > 15 || !PhonePattern().IsMatch(phone))
        {
            return "Enter a valid contact phone number.";
        }

        location.AddressLine = addressLine;
        location.City = city;
        location.Landmark = location.Landmark?.Trim();
        location.ContactPhone = phone;

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
            && (latitude.Value < bounds.MinLat
                || latitude.Value > bounds.MaxLat
                || longitude.Value < bounds.MinLng
                || longitude.Value > bounds.MaxLng))
        {
            return $"Choose a location within Nepal (latitude {bounds.MinLat} to {bounds.MaxLat}, longitude {bounds.MinLng} to {bounds.MaxLng}).";
        }

        return null;
    }
}
