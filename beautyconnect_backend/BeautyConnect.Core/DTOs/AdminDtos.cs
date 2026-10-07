using System.ComponentModel.DataAnnotations;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.DTOs;

public class PendingProfessionalVerificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Speciality { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? AvatarUrl { get; set; }
    public VerificationStatus VerificationStatus { get; set; }
}

public class AdminDisputeDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int RaisedByUserId { get; set; }
    public string RaisedByEmail { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DisputeStatus Status { get; set; }
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime BookingScheduledDateTime { get; set; }
    public decimal BookingTotalPrice { get; set; }
}

public class ResolveDisputeDto
{
    [Required, StringLength(2000, MinimumLength = 1)]
    public string ResolutionNotes { get; set; } = string.Empty;
}

public class PlatformAnalyticsDto
{
    public int TotalBookings { get; set; }
    public decimal Revenue { get; set; }
    public int ActiveUsers { get; set; }
    public int VerifiedProfessionalCount { get; set; }
    public DateTime ActiveUsersSinceUtc { get; set; }
}
