using System.ComponentModel.DataAnnotations;
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
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string ProfessionalBusinessName { get; set; } = string.Empty;
    public ServiceDto Service { get; set; } = new();
}
