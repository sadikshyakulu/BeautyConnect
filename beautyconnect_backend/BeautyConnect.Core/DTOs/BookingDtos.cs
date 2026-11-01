using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.DTOs;

public class BookingCreateDto
{
    [Range(1, int.MaxValue)]
    public int ServiceId { get; set; }

    [Required]
    public DateTimeOffset ScheduledDateTime { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }
}

public class BookingCancellationDto
{
    [Required, StringLength(1000, MinimumLength = 3)]
    public string Reason { get; set; } = string.Empty;
}

public sealed class BookingLocationDto
{
    [Required, StringLength(300, MinimumLength = 5)]
    public string AddressLine { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 2)]
    public string City { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Landmark { get; set; }

    [Required, Range(-90, 90)]
    public double? Latitude { get; set; }

    [Required, Range(-180, 180)]
    public double? Longitude { get; set; }

    [Required, StringLength(30)]
    public string ContactPhone { get; set; } = string.Empty;
}

public class BookingDto
{
    public int Id { get; set; }
    public int CustomerProfileId { get; set; }
    public int ProfessionalProfileId { get; set; }
    public int ServiceId { get; set; }
    public DateTimeOffset ScheduledDateTime { get; set; }
    public DateTimeOffset EndDateTime { get; set; }
    public BookingStatus Status { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal CommissionAmount { get; set; }
    public decimal? RefundAmount { get; set; }
    public RefundStatus RefundStatus { get; set; }
    public DateTime? RefundRequestedAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public string? RefundGatewayReference { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public BookingLocationDto? Location { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    [JsonPropertyName("customerAvatarUrl")]
    public string? CustomerAvatarUrl { get; set; }
    public string ProfessionalBusinessName { get; set; } = string.Empty;
    public string? ProfessionalPhoneNumber { get; set; }
    public bool HasReview { get; set; }
    public ServiceDto Service { get; set; } = new();
}
