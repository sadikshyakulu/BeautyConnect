using Microsoft.EntityFrameworkCore;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;

namespace BeautyConnect.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly BeautyConnectDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public AuthService(
        BeautyConnectDbContext context,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<(AuthResponseDto? Response, string? RefreshToken, string? Error)> RegisterAsync(RegisterRequestDto dto, string ipAddress)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
        {
            return (null, null, "Email is already registered.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        if (dto.Role == UserRole.Customer)
        {
            var customer = new CustomerProfile
            {
                UserId = user.Id,
                FullName = dto.FullName ?? "Beauty Enthusiast",
                PhoneNumber = dto.PhoneNumber
            };
            _context.CustomerProfiles.Add(customer);
        }
        else if (dto.Role == UserRole.Professional)
        {
            var pro = new ProfessionalProfile
            {
                UserId = user.Id,
                BusinessName = dto.BusinessName ?? (dto.FullName != null ? $"{dto.FullName} Studio" : "Beauty Studio"),
                Speciality = dto.Speciality ?? "Master Stylist & Artist",
                City = dto.City ?? "New York, NY",
                VerificationStatus = VerificationStatus.Pending // Submitted for Admin verification
            };
            _context.ProfessionalProfiles.Add(pro);
        }

        var (accessToken, expiresAt) = _jwtProvider.GenerateAccessToken(user);
        var refreshToken = _jwtProvider.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        object? profileData = null;
        if (dto.Role == UserRole.Customer)
        {
            var p = await _context.CustomerProfiles.FirstOrDefaultAsync(c => c.UserId == user.Id);
            profileData = p != null ? new { p.FullName, p.PhoneNumber, p.AvatarUrl } : null;
        }
        else if (dto.Role == UserRole.Professional)
        {
            var p = await _context.ProfessionalProfiles.FirstOrDefaultAsync(pr => pr.UserId == user.Id);
            profileData = p != null ? new { p.BusinessName, p.Speciality, p.City, p.VerificationStatus } : null;
        }

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            AccessToken = accessToken,
            ExpiresAt = expiresAt,
            Profile = profileData
        };

        return (response, refreshToken.Token, null);
    }

    public async Task<(AuthResponseDto? Response, string? RefreshToken, string? Error)> LoginAsync(LoginRequestDto dto, string ipAddress)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .Include(u => u.CustomerProfile)
            .Include(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return (null, null, "Invalid email or password.");
        }

        var (accessToken, expiresAt) = _jwtProvider.GenerateAccessToken(user);
        var refreshToken = _jwtProvider.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        object? profileData = null;
        if (user.Role == UserRole.Customer && user.CustomerProfile != null)
        {
            profileData = new
            {
                user.CustomerProfile.FullName,
                user.CustomerProfile.PhoneNumber,
                user.CustomerProfile.AvatarUrl
            };
        }
        else if (user.Role == UserRole.Professional && user.ProfessionalProfile != null)
        {
            profileData = new
            {
                user.ProfessionalProfile.BusinessName,
                user.ProfessionalProfile.Speciality,
                user.ProfessionalProfile.City,
                VerificationStatus = user.ProfessionalProfile.VerificationStatus.ToString(),
                user.ProfessionalProfile.AvatarUrl,
                user.ProfessionalProfile.RatingAverage
            };
        }

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            AccessToken = accessToken,
            ExpiresAt = expiresAt,
            Profile = profileData
        };

        return (response, refreshToken.Token, null);
    }

    public async Task<(AuthResponseDto? Response, string? RefreshToken, string? Error)> RefreshTokenAsync(string token, string ipAddress)
    {
        var storedToken = await _context.RefreshTokens
            .Include(t => t.User)
            .ThenInclude(u => u.CustomerProfile)
            .Include(t => t.User)
            .ThenInclude(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(t => t.Token == token);

        if (storedToken == null || !storedToken.IsActive)
        {
            return (null, null, "Invalid or expired refresh token.");
        }

        // Revoke current token and generate new one (rotation)
        storedToken.RevokedAt = DateTime.UtcNow;

        var user = storedToken.User;
        var (accessToken, expiresAt) = _jwtProvider.GenerateAccessToken(user);
        var newRefreshToken = _jwtProvider.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        object? profileData = user.Role switch
        {
            UserRole.Customer when user.CustomerProfile != null => new
            {
                user.CustomerProfile.FullName,
                user.CustomerProfile.PhoneNumber,
                user.CustomerProfile.AvatarUrl
            },
            UserRole.Professional when user.ProfessionalProfile != null => new
            {
                user.ProfessionalProfile.BusinessName,
                user.ProfessionalProfile.Speciality,
                user.ProfessionalProfile.City,
                VerificationStatus = user.ProfessionalProfile.VerificationStatus.ToString(),
                user.ProfessionalProfile.AvatarUrl
            },
            _ => null
        };

        var response = new AuthResponseDto
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            AccessToken = accessToken,
            ExpiresAt = expiresAt,
            Profile = profileData
        };

        return (response, newRefreshToken.Token, null);
    }

    public async Task<bool> RevokeTokenAsync(string token)
    {
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == token);
        if (storedToken == null || !storedToken.IsActive) return false;

        storedToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.CustomerProfile)
            .Include(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        object? profileData = user.Role switch
        {
            UserRole.Customer when user.CustomerProfile != null => new
            {
                user.CustomerProfile.FullName,
                user.CustomerProfile.PhoneNumber,
                user.CustomerProfile.AvatarUrl
            },
            UserRole.Professional when user.ProfessionalProfile != null => new
            {
                user.ProfessionalProfile.BusinessName,
                user.ProfessionalProfile.Speciality,
                user.ProfessionalProfile.City,
                VerificationStatus = user.ProfessionalProfile.VerificationStatus.ToString(),
                user.ProfessionalProfile.AvatarUrl
            },
            _ => null
        };

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            Profile = profileData
        };
    }
}
