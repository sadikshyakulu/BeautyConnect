using System.Text.Json;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public class ProfessionalProfileService : IProfessionalProfileService
{
    private const long MaximumImageSize = 5 * 1024 * 1024;
    private readonly BeautyConnectDbContext _context;
    private readonly string _uploadDirectory;

    public ProfessionalProfileService(BeautyConnectDbContext context, string uploadDirectory)
    {
        _context = context;
        _uploadDirectory = uploadDirectory;
    }

    public async Task<ProfessionalProfileDto?> GetProfileAsync(int userId)
    {
        var profile = await _context.ProfessionalProfiles
            .AsNoTracking()
            .Include(p => p.Services)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        return profile == null ? null : ToDto(profile);
    }

    public async Task<ProfessionalProfileDto?> GetProfileByIdAsync(int profileId)
    {
        var profile = await _context.ProfessionalProfiles
            .AsNoTracking()
            .Include(p => p.Services)
            .FirstOrDefaultAsync(p => p.Id == profileId);

        return profile == null ? null : ToDto(profile);
    }

    public async Task<ProfessionalProfileDto> SaveProfileAsync(int userId, ProfessionalProfileUpdateDto dto)
    {
        var profile = await _context.ProfessionalProfiles
            .Include(p => p.Services)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new ProfessionalProfile { UserId = userId };
            _context.ProfessionalProfiles.Add(profile);
        }

        profile.BusinessName = dto.BusinessName.Trim();
        profile.Bio = dto.Bio?.Trim();
        profile.Speciality = dto.Speciality?.Trim();
        profile.City = dto.City?.Trim();
        profile.Address = dto.Address?.Trim();
        profile.Latitude = dto.Latitude;
        profile.Longitude = dto.Longitude;
        profile.AvatarUrl = dto.AvatarUrl?.Trim();
        profile.ServiceCategoriesJson = JsonSerializer.Serialize(
            dto.ServiceCategories
                .Where(category => !string.IsNullOrWhiteSpace(category))
                .Select(category => category.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList());

        await _context.SaveChangesAsync();
        return ToDto(profile);
    }

    public async Task<ServiceDto?> AddServiceAsync(int userId, ServiceUpsertDto dto)
    {
        var profileId = await _context.ProfessionalProfiles
            .Where(p => p.UserId == userId)
            .Select(p => (int?)p.Id)
            .FirstOrDefaultAsync();

        if (profileId == null)
        {
            return null;
        }

        var service = new Service
        {
            ProfessionalProfileId = profileId.Value,
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category.Trim(),
            Price = dto.Price,
            DurationMinutes = dto.DurationMinutes
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();
        return ToDto(service);
    }

    public async Task<ServiceDto?> UpdateServiceAsync(int userId, int serviceId, ServiceUpsertDto dto)
    {
        var service = await _context.Services
            .Include(s => s.ProfessionalProfile)
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.ProfessionalProfile.UserId == userId);

        if (service == null)
        {
            return null;
        }

        service.Name = dto.Name.Trim();
        service.Description = dto.Description.Trim();
        service.Category = dto.Category.Trim();
        service.Price = dto.Price;
        service.DurationMinutes = dto.DurationMinutes;

        await _context.SaveChangesAsync();
        return ToDto(service);
    }

    public async Task<PortfolioImageUploadResultDto?> AddPortfolioImageAsync(
        int userId,
        Stream imageStream,
        string contentType,
        long contentLength)
    {
        var profile = await _context.ProfessionalProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
        {
            return null;
        }

        if (contentLength <= 0 || contentLength > MaximumImageSize)
        {
            return new PortfolioImageUploadResultDto { Error = "Image must be between 1 byte and 5 MB." };
        }

        var extension = contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            _ => null
        };
        if (extension == null)
        {
            return new PortfolioImageUploadResultDto { Error = "Only JPEG and PNG images are supported." };
        }

        var prefix = new byte[8];
        var bytesRead = await imageStream.ReadAsync(prefix);
        var isValidImage = contentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase)
            ? bytesRead >= 3 && prefix[0] == 0xFF && prefix[1] == 0xD8 && prefix[2] == 0xFF
            : bytesRead == 8 && prefix.SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });
        if (!isValidImage || !imageStream.CanSeek)
        {
            return new PortfolioImageUploadResultDto { Error = "The uploaded file is not a valid JPEG or PNG image." };
        }

        imageStream.Position = 0;
        Directory.CreateDirectory(_uploadDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(_uploadDirectory, fileName);
        var imageUrl = $"/uploads/portfolio/{fileName}";

        await using (var output = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
        {
            await imageStream.CopyToAsync(output);
        }

        try
        {
            var images = JsonSerializer.Deserialize<List<string>>(profile.PortfolioImagesJson) ?? [];
            images.Add(imageUrl);
            profile.PortfolioImagesJson = JsonSerializer.Serialize(images);
            await _context.SaveChangesAsync();
        }
        catch
        {
            File.Delete(filePath);
            throw;
        }

        return new PortfolioImageUploadResultDto { ImageUrl = imageUrl };
    }

    public async Task<bool> SubmitForVerificationAsync(int userId)
    {
        var profile = await _context.ProfessionalProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null)
        {
            return false;
        }

        profile.VerificationStatus = VerificationStatus.Pending;
        await _context.SaveChangesAsync();
        return true;
    }

    private static ProfessionalProfileDto ToDto(ProfessionalProfile profile) => new()
    {
        Id = profile.Id,
        UserId = profile.UserId,
        BusinessName = profile.BusinessName,
        Bio = profile.Bio,
        Speciality = profile.Speciality,
        City = profile.City,
        Address = profile.Address,
        Latitude = profile.Latitude,
        Longitude = profile.Longitude,
        RatingAverage = profile.RatingAverage,
        TotalReviews = profile.TotalReviews,
        VerificationStatus = profile.VerificationStatus,
        AvatarUrl = profile.AvatarUrl,
        ServiceCategories = JsonSerializer.Deserialize<List<string>>(profile.ServiceCategoriesJson) ?? [],
        PortfolioImages = JsonSerializer.Deserialize<List<string>>(profile.PortfolioImagesJson) ?? [],
        Services = profile.Services.Select(ToDto).ToList()
    };

    private static ServiceDto ToDto(Service service) => new()
    {
        Id = service.Id,
        ProfessionalProfileId = service.ProfessionalProfileId,
        Name = service.Name,
        Description = service.Description,
        Category = service.Category,
        Price = service.Price,
        DurationMinutes = service.DurationMinutes
    };
}
