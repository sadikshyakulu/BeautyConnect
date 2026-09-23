using System.Security.Claims;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BeautyConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var ip = GetClientIp();
        var (response, refreshToken, error) = await _authService.RegisterAsync(dto, ip);

        if (error != null)
        {
            _logger.LogWarning("Registration failed for {Email}: {Error}", dto.Email, error);
            return BadRequest(new { message = error });
        }

        SetRefreshTokenCookie(refreshToken!);
        _logger.LogInformation("User {Email} registered successfully as {Role}", dto.Email, dto.Role);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var ip = GetClientIp();
        var (response, refreshToken, error) = await _authService.LoginAsync(dto, ip);

        if (error != null)
        {
            _logger.LogWarning("Login attempt failed for {Email}: {Error}", dto.Email, error);
            return Unauthorized(new { message = error });
        }

        SetRefreshTokenCookie(refreshToken!);
        _logger.LogInformation("User {Email} logged in successfully", dto.Email);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        var token = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { message = "No refresh token provided." });
        }

        var ip = GetClientIp();
        var (response, newRefreshToken, error) = await _authService.RefreshTokenAsync(token, ip);

        if (error != null)
        {
            Response.Cookies.Delete("refreshToken");
            return Unauthorized(new { message = error });
        }

        SetRefreshTokenCookie(newRefreshToken!);
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(token))
        {
            await _authService.RevokeTokenAsync(token);
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });

        return Ok(new { message = "Logged out successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null) return NotFound();

        return Ok(user);
    }

    private void SetRefreshTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to true in HTTPS production
            SameSite = SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", token, cookieOptions);
    }

    private string GetClientIp()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"]!;
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
