using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public class SearchService : ISearchService
{
    private const double ServiceMatchWeight = 0.35;
    private const double ProximityWeight = 0.25;
    private const double PriceFitWeight = 0.20;
    private const double RatingWeight = 0.20;
    private readonly BeautyConnectDbContext _context;

    public SearchService(BeautyConnectDbContext context)
    {
        _context = context;
    }

    public async Task<ProfessionalSearchResponseDto> SearchProfessionalsAsync(
        ProfessionalSearchQueryDto query)
    {
        var serviceType = query.ServiceType?.Trim();
        var city = query.City?.Trim();
        var hasServiceFilter = !string.IsNullOrEmpty(serviceType);
        var hasLocationFilter = !string.IsNullOrEmpty(city) || query.Latitude.HasValue;
        var hasPriceFilter = query.MinPrice.HasValue || query.MaxPrice.HasValue;

        var professionals = _context.ProfessionalProfiles
            .AsNoTracking()
            .Where(profile => profile.VerificationStatus == VerificationStatus.Approved);

        if (hasServiceFilter || hasPriceFilter)
        {
            professionals = professionals.Where(profile =>
                _context.Services.Any(service =>
                    service.ProfessionalProfileId == profile.Id
                    && (!hasServiceFilter
                        || service.Category == serviceType
                        || service.Name.Contains(serviceType!))
                    && (!query.MinPrice.HasValue || service.Price >= query.MinPrice.Value)
                    && (!query.MaxPrice.HasValue || service.Price <= query.MaxPrice.Value)));
        }

        if (!string.IsNullOrEmpty(city))
        {
            professionals = professionals.Where(profile => profile.City == city);
        }

        if (query.MinRating.HasValue)
        {
            professionals = professionals.Where(profile => profile.RatingAverage >= query.MinRating.Value);
        }

        if (query.AvailabilityDate.HasValue)
        {
            var date = query.AvailabilityDate.Value;
            var dayOfWeek = date.DayOfWeek;
            professionals = professionals.Where(profile =>
                _context.Availabilities.Any(availability =>
                    availability.ProfessionalProfileId == profile.Id
                    && availability.IsAvailable
                    && availability.SpecificDate == date)
                || (!_context.Availabilities.Any(availability =>
                        availability.ProfessionalProfileId == profile.Id
                        && availability.SpecificDate == date)
                    && _context.Availabilities.Any(availability =>
                        availability.ProfessionalProfileId == profile.Id
                        && availability.IsAvailable
                        && availability.SpecificDate == null
                        && availability.DayOfWeek == dayOfWeek)));
        }

        var candidates = await professionals
            .Include(profile => profile.Services)
            .ToListAsync();

        var ranked = candidates
            .Select(profile => RankProfessional(profile, query, serviceType, city))
            .Where(result => !query.Latitude.HasValue
                || result.DistanceKm <= query.RadiusKm)
            .OrderByDescending(result => result.MatchScore)
            .ThenByDescending(result => result.RatingAverage)
            .ThenBy(result => result.Id)
            .ToList();

        var offset = (int)Math.Min((long)(query.Page - 1) * query.PageSize, int.MaxValue);
        return new ProfessionalSearchResponseDto
        {
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = ranked.Count,
            Results = ranked.Skip(offset).Take(query.PageSize).ToList()
        };
    }

    private static ProfessionalSearchResultDto RankProfessional(
        ProfessionalProfile profile,
        ProfessionalSearchQueryDto query,
        string? serviceType,
        string? city)
    {
        var matchingServices = profile.Services
            .Where(service =>
                (string.IsNullOrEmpty(serviceType)
                    || string.Equals(service.Category, serviceType, StringComparison.OrdinalIgnoreCase)
                    || service.Name.Contains(serviceType, StringComparison.OrdinalIgnoreCase))
                && (!query.MinPrice.HasValue || service.Price >= query.MinPrice.Value)
                && (!query.MaxPrice.HasValue || service.Price <= query.MaxPrice.Value))
            .ToList();

        var activeWeight = RatingWeight;
        var weightedScore = profile.RatingAverage / 5.0 * RatingWeight;

        if (!string.IsNullOrEmpty(serviceType))
        {
            activeWeight += ServiceMatchWeight;
            if (matchingServices.Count > 0)
            {
                weightedScore += ServiceMatchWeight;
            }
        }

        double? distanceKm = null;
        if (!string.IsNullOrEmpty(city) || query.Latitude.HasValue)
        {
            activeWeight += ProximityWeight;
            var proximityScore = 1.0;
            if (query.Latitude.HasValue && query.Longitude.HasValue)
            {
                distanceKm = CalculateDistanceKm(
                    query.Latitude.Value,
                    query.Longitude.Value,
                    profile.Latitude,
                    profile.Longitude);
                proximityScore = Math.Max(0, 1 - distanceKm.Value / query.RadiusKm);
            }

            weightedScore += proximityScore * ProximityWeight;
        }

        if (query.MinPrice.HasValue || query.MaxPrice.HasValue)
        {
            activeWeight += PriceFitWeight;
            if (matchingServices.Count > 0)
            {
                var lowestMatchingPrice = matchingServices.Min(service => service.Price);
                weightedScore += GetPriceFitScore(lowestMatchingPrice, query) * PriceFitWeight;
            }
        }

        return new ProfessionalSearchResultDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            BusinessName = profile.BusinessName,
            Bio = profile.Bio,
            Speciality = profile.Speciality,
            City = profile.City,
            Address = profile.Address,
            Latitude = profile.Latitude,
            Longitude = profile.Longitude,
            RatingAverage = profile.RatingAverage,
            TotalReviews = profile.TotalReviews,
            VerificationStatus = profile.VerificationStatus,
            AvatarUrl = profile.AvatarUrl,
            MatchScore = Math.Round(weightedScore / activeWeight * 100, 2),
            DistanceKm = distanceKm.HasValue ? Math.Round(distanceKm.Value, 2) : null,
            MatchingServices = matchingServices.Select(ToDto).ToList()
        };
    }

    private static double GetPriceFitScore(decimal price, ProfessionalSearchQueryDto query)
    {
        if (query.MinPrice.HasValue && query.MaxPrice.HasValue)
        {
            var midpoint = (query.MinPrice.Value + query.MaxPrice.Value) / 2;
            var halfRange = (query.MaxPrice.Value - query.MinPrice.Value) / 2;
            if (halfRange == 0)
            {
                return 1;
            }

            return (double)(1 - Math.Abs(price - midpoint) / halfRange);
        }

        if (query.MinPrice.HasValue)
        {
            var difference = price - query.MinPrice.Value;
            return (double)(1 / (1 + difference / Math.Max(query.MinPrice.Value, 1)));
        }

        if (query.MaxPrice == 0)
        {
            return price == 0 ? 1 : 0;
        }

        return (double)(1 - price / query.MaxPrice!.Value);
    }

    private static double CalculateDistanceKm(
        double latitude1,
        double longitude1,
        double latitude2,
        double longitude2)
    {
        const double earthRadiusKm = 6371.0;
        var latitudeDelta = ToRadians(latitude2 - latitude1);
        var longitudeDelta = ToRadians(longitude2 - longitude1);
        var haversine = Math.Pow(Math.Sin(latitudeDelta / 2), 2)
            + Math.Cos(ToRadians(latitude1))
            * Math.Cos(ToRadians(latitude2))
            * Math.Pow(Math.Sin(longitudeDelta / 2), 2);

        return earthRadiusKm * 2 * Math.Asin(Math.Sqrt(Math.Clamp(haversine, 0, 1)));
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;

    private static ServiceDto ToDto(Service service) => new()
    {
        Id = service.Id,
        ProfessionalProfileId = service.ProfessionalProfileId,
        Name = service.Name,
        Description = service.Description,
        Category = service.Category,
        Price = service.Price,
        DurationMinutes = service.DurationMinutes
    };
}
