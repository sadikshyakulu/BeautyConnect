using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;

namespace BeautyConnect.Core.Interfaces;

public interface IAuthService
{
    Task<(AuthResponseDto? Response, string? RefreshToken, string? Error)> RegisterAsync(RegisterRequestDto dto, string ipAddress);
    Task<(AuthResponseDto? Response, string? RefreshToken, string? Error)> LoginAsync(LoginRequestDto dto, string ipAddress);
    Task<(AuthResponseDto? Response, string? RefreshToken, string? Error)> RefreshTokenAsync(string token, string ipAddress);
    Task<bool> RevokeTokenAsync(string token);
    Task<UserDto?> GetCurrentUserAsync(int userId);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public interface IJwtProvider
{
    (string Token, DateTime ExpiresAt) GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(int userId);
}
