using System.ComponentModel.DataAnnotations;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.DTOs;

public class ProfessionalProfileUpdateDto
{
    [Required, StringLength(150)]
    public string BusinessName { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Bio { get; set; }

    [StringLength(150)]
    public string? Speciality { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [Range(-90, 90)]
    public double Latitude { get; set; }

    [Range(-180, 180)]
    public double Longitude { get; set; }

    [Url, StringLength(500)]
    public string? AvatarUrl { get; set; }

    [Required, MaxLength(20)]
    public List<string> ServiceCategories { get; set; } = [];
}

public class ProfessionalProfileDto
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
    public List<string> ServiceCategories { get; set; } = [];
    public List<string> PortfolioImages { get; set; } = [];
    public List<ServiceDto> Services { get; set; } = [];
}

public class ServiceUpsertDto
{
    [Required, StringLength(150)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Category { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "99999999.99")]
    public decimal Price { get; set; }

    [Range(1, 1440)]
    public int DurationMinutes { get; set; } = 60;
}

public class ServiceDto
{
    public int Id { get; set; }
    public int ProfessionalProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
}

public class PortfolioImageUploadResultDto
{
    public string? ImageUrl { get; set; }
    public string? Error { get; set; }
}
