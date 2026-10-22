using BeautyConnect.Core.DTOs;

namespace BeautyConnect.Core.Interfaces;

public interface IProfileImageService
{
    Task<(ProfileImageUploadResultDto? Result, string? Error)> UploadAvatarAsync(
        int userId,
        Stream imageStream,
        string contentType,
        long contentLength);
}
