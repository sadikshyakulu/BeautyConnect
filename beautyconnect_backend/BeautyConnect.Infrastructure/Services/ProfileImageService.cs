using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BeautyConnect.Infrastructure.Services;

public sealed class ProfileImageService : IProfileImageService
{
    private const long MaximumImageSize = 5 * 1024 * 1024;
    private readonly BeautyConnectDbContext _context;
    private readonly string _uploadDirectory;

    public ProfileImageService(BeautyConnectDbContext context, string uploadDirectory)
    {
        _context = context;
        _uploadDirectory = uploadDirectory;
    }

    public async Task<(ProfileImageUploadResultDto? Result, string? Error)> UploadAvatarAsync(
        int userId,
        Stream imageStream,
        string contentType,
        long contentLength)
    {
        if (contentLength is <= 0 or > MaximumImageSize)
        {
            return (null, "Profile images must be between 1 byte and 5 MB.");
        }

        var extension = contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            _ => null
        };
        if (extension == null)
        {
            return (null, "Only JPEG and PNG profile images are supported.");
        }

        var prefix = new byte[8];
        var bytesRead = await imageStream.ReadAsync(prefix);
        var isValidImage = contentType.Equals("image/jpeg", StringComparison.OrdinalIgnoreCase)
            ? bytesRead >= 3 && prefix[0] == 0xFF && prefix[1] == 0xD8 && prefix[2] == 0xFF
            : bytesRead == 8 && prefix.SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });
        if (!isValidImage || !imageStream.CanSeek)
        {
            return (null, "The uploaded file is not a valid JPEG or PNG image.");
        }

        var customer = await _context.CustomerProfiles.FirstOrDefaultAsync(profile => profile.UserId == userId);
        var professional = customer == null
            ? await _context.ProfessionalProfiles.FirstOrDefaultAsync(profile => profile.UserId == userId)
            : null;
        if (customer == null && professional == null)
        {
            return (null, "Profile not found.");
        }

        imageStream.Position = 0;
        Directory.CreateDirectory(_uploadDirectory);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(_uploadDirectory, fileName);
        var imageUrl = $"/uploads/avatars/{fileName}";

        await using (var output = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
        {
            await imageStream.CopyToAsync(output);
        }

        try
        {
            if (customer != null)
            {
                customer.AvatarUrl = imageUrl;
            }
            else
            {
                professional!.AvatarUrl = imageUrl;
            }

            await _context.SaveChangesAsync();
        }
        catch
        {
            File.Delete(filePath);
            throw;
        }

        return (new ProfileImageUploadResultDto { AvatarUrl = imageUrl }, null);
    }
}
