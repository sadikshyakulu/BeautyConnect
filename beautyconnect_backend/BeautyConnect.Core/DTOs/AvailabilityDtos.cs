using System.ComponentModel.DataAnnotations;

namespace BeautyConnect.Core.DTOs;

public class AvailabilityUpsertDto
{
    [EnumDataType(typeof(DayOfWeek))]
    public DayOfWeek? DayOfWeek { get; set; }

    public DateOnly? SpecificDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public bool IsAvailable { get; set; } = true;
}

public class AvailabilityDto
{
    public int Id { get; set; }
    public DayOfWeek? DayOfWeek { get; set; }
    public DateOnly? SpecificDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsAvailable { get; set; }
}

public class OpenAvailabilitySlotDto
{
    public int AvailabilityId { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
