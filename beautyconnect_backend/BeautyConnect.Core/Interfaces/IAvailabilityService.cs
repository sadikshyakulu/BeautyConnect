using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IAvailabilityService
{
    Task<List<AvailabilityDto>?> GetMyAvailabilityAsync(int userId);

    Task<(AvailabilityDto? Availability, string? Error)> CreateAsync(
        int userId,
        AvailabilityUpsertDto dto);

    Task<(AvailabilityDto? Availability, string? Error)> UpdateAsync(
        int userId,
        int availabilityId,
        AvailabilityUpsertDto dto);

    Task<(List<OpenAvailabilitySlotDto>? Slots, string? Error)> GetOpenSlotsAsync(
        int professionalProfileId,
        DateOnly date);
}
