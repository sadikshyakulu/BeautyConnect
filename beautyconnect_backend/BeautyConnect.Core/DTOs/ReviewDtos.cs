using System.ComponentModel.DataAnnotations;

namespace BeautyConnect.Core.DTOs;

public class ReviewCreateDto
{
    [Range(1, int.MaxValue)]
    public int BookingId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [Required, StringLength(2000, MinimumLength = 1)]
    public string Comment { get; set; } = string.Empty;
}

public class ReviewDto
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int CustomerProfileId { get; set; }
    public int ProfessionalProfileId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
}
