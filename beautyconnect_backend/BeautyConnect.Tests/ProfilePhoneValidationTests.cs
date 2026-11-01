using System.ComponentModel.DataAnnotations;
using BeautyConnect.Core.DTOs;
using BeautyConnect.Core.Enums;
using Xunit;

namespace BeautyConnect.Tests;

public class ProfilePhoneValidationTests
{
    [Theory]
    [InlineData(UserRole.Customer)]
    [InlineData(UserRole.Professional)]
    public void RegistrationAcceptsValidPhoneForBothRoles(UserRole role)
    {
        var request = new RegisterRequestDto
        {
            Email = "person@example.com",
            Password = "password",
            Role = role,
            PhoneNumber = "+977 9812345678"
        };

        Assert.Empty(Validate(request));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("123456")]
    [InlineData("1234567890123456")]
    [InlineData("(981) 234-5678")]
    public void RegistrationRejectsMissingOrInvalidPhone(string? phoneNumber)
    {
        var request = new RegisterRequestDto
        {
            Email = "person@example.com",
            Password = "password",
            Role = UserRole.Customer,
            PhoneNumber = phoneNumber
        };

        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void CustomerProfileUpdateRequiresValidPhone()
    {
        var request = new CustomerProfileUpdateDto
        {
            FullName = "Beauty Client",
            PhoneNumber = "+977 9812345678"
        };

        Assert.Empty(Validate(request));
        request.PhoneNumber = "123456";
        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void ProfessionalProfileUpdateRequiresValidPhone()
    {
        var request = new ProfessionalProfileUpdateDto
        {
            BusinessName = "Beauty Studio",
            PhoneNumber = "+977 9812345678"
        };

        Assert.Empty(Validate(request));
        request.PhoneNumber = "123456";
        Assert.NotEmpty(Validate(request));
    }

    [Fact]
    public void ProfessionalProfileUpdateAcceptsUploadedRelativeAvatarPath()
    {
        var request = new ProfessionalProfileUpdateDto
        {
            BusinessName = "Beauty Studio",
            PhoneNumber = "+977 9812345678",
            AvatarUrl = "/uploads/avatars/profile.jpg"
        };

        Assert.Empty(Validate(request));
    }

    private static List<ValidationResult> Validate(object instance)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(instance, new ValidationContext(instance), results, validateAllProperties: true);
        return results;
    }
}
