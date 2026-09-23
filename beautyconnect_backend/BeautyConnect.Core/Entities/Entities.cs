using System.Text.Json.Serialization;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public CustomerProfile? CustomerProfile { get; set; }
    public ProfessionalProfile? ProfessionalProfile { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => RevokedAt == null && !IsExpired;

    public User User { get; set; } = null!;
}

public class CustomerProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class ProfessionalProfile
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
    public double RatingAverage { get; set; } = 5.0;
    public int TotalReviews { get; set; } = 0;
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
    public string? AvatarUrl { get; set; }
    public string ServiceCategoriesJson { get; set; } = "[]"; // e.g. ["Hair", "Makeup", "Bridal"]
    public string PortfolioImagesJson { get; set; } = "[]";    // list of image URLs

    public User User { get; set; } = null!;
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public class Service
{
    public int Id { get; set; }
    public int ProfessionalProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; } = 60;

    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}

public class Availability
{
    public int Id { get; set; }
    public int ProfessionalProfileId { get; set; }
    public DayOfWeek? DayOfWeek { get; set; }
    public DateOnly? SpecificDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;

    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
}

public class Booking
{
    public int Id { get; set; }
    public int CustomerProfileId { get; set; }
    public int ProfessionalProfileId { get; set; }
    public int ServiceId { get; set; }
    public DateTime ScheduledDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public decimal TotalPrice { get; set; }
    public decimal CommissionAmount { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CustomerProfile CustomerProfile { get; set; } = null!;
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public Service Service { get; set; } = null!;
    public Review? Review { get; set; }
    public Dispute? Dispute { get; set; }
}

public class Review
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int CustomerProfileId { get; set; }
    public int ProfessionalProfileId { get; set; }
    public int Rating { get; set; } // 1 to 5
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Booking Booking { get; set; } = null!;
    public CustomerProfile CustomerProfile { get; set; } = null!;
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
}

public class Dispute
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int RaisedByUserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DisputeStatus Status { get; set; } = DisputeStatus.Open;
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Booking Booking { get; set; } = null!;
    public User RaisedByUser { get; set; } = null!;
}
