using System.ComponentModel.DataAnnotations;
using BeautyConnect.Core.Enums;

namespace BeautyConnect.Core.DTOs;

public class RegisterRequestDto : IValidatableObject
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; } = UserRole.Customer;

    public string? FullName { get; set; }
    public string? BusinessName { get; set; }
    [Required, StringLength(30, MinimumLength = 7)]
    [RegularExpression(@"^(?=(?:\D*\d){7,15}\D*$)[0-9+\s-]+$", ErrorMessage = "Enter a phone number using digits, spaces, + or - with 7 to 15 digits.")]
    public string? PhoneNumber { get; set; }
    public string? Speciality { get; set; }
    public string? City { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Role is not UserRole.Customer and not UserRole.Professional)
        {
            yield return new ValidationResult(
                "Public registration is only available for Customer and Professional accounts.",
                new[] { nameof(Role) });
        }
    }
}

public class CustomerProfileUpdateDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required, StringLength(30, MinimumLength = 7)]
    [RegularExpression(@"^(?=(?:\D*\d){7,15}\D*$)[0-9+\s-]+$", ErrorMessage = "Enter a phone number using digits, spaces, + or - with 7 to 15 digits.")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class LoginRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public object? Profile { get; set; }
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public object? Profile { get; set; }
}
