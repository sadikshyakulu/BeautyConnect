using System.ComponentModel.DataAnnotations;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.DTOs;

public class ProfessionalSearchQueryDto
{
    [StringLength(100)]
    public string? ServiceType { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [Range(typeof(decimal), "0", "99999999.99")]
    public decimal? MinPrice { get; set; }

    [Range(typeof(decimal), "0", "99999999.99")]
    public decimal? MaxPrice { get; set; }

    public DateOnly? AvailabilityDate { get; set; }

    [Range(0, 5)]
    public double? MinRating { get; set; }

    [Range(-90, 90)]
    public double? Latitude { get; set; }

    [Range(-180, 180)]
    public double? Longitude { get; set; }

    [Range(1, 500)]
    public double RadiusKm { get; set; } = 50;

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
}

public class ProfessionalSearchResultDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Speciality { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RatingAverage { get; set; }
    public int TotalReviews { get; set; }
    public VerificationStatus VerificationStatus { get; set; }
    public string? AvatarUrl { get; set; }
    public double MatchScore { get; set; }
    public double? DistanceKm { get; set; }
    public List<ServiceDto> MatchingServices { get; set; } = [];
}

public class ProfessionalSearchResponseDto
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public List<ProfessionalSearchResultDto> Results { get; set; } = [];
}
