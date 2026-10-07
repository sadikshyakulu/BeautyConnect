using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IProfessionalProfileService
{
    Task<ProfessionalProfileDto?> GetProfileAsync(int userId);
    Task<ProfessionalProfileDto?> GetProfileByIdAsync(int profileId);
    Task<ProfessionalProfileDto> SaveProfileAsync(int userId, ProfessionalProfileUpdateDto dto);
    Task<ServiceDto?> AddServiceAsync(int userId, ServiceUpsertDto dto);
    Task<ServiceDto?> UpdateServiceAsync(int userId, int serviceId, ServiceUpsertDto dto);
    Task<PortfolioImageUploadResultDto?> AddPortfolioImageAsync(
        int userId,
        Stream imageStream,
        string contentType,
        long contentLength);
    Task<bool> SubmitForVerificationAsync(int userId);
}
