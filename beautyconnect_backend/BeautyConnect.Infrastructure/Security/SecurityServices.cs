using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BeautyConnect.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        // BCrypt work factor 12 requirement
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(hash) || string.IsNullOrEmpty(password)) return false;
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }
}

public class JwtProvider : IJwtProvider
{
    private readonly IConfiguration _config;

    public JwtProvider(IConfiguration config)
    {
        _config = config;
    }

    public (string Token, DateTime ExpiresAt) GenerateAccessToken(User user)
    {
        var secretKey = _config["Jwt:Key"] ?? "BeautyConnectSuperSecretKeyForJwtAuthenticationMustBeAtLeast32CharsLong!";
        var issuer = _config["Jwt:Issuer"] ?? "BeautyConnectApi";
        var audience = _config["Jwt:Audience"] ?? "BeautyConnectClient";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 15 minutes expiry requirement
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("role", user.Role.ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiresAt);
    }

    public RefreshToken GenerateRefreshToken(int userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);

        return new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(randomBytes),
            // 7 days refresh token expiry requirement
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };
    }
}
