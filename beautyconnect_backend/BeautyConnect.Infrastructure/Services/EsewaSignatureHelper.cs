using System.Security.Cryptography;
using System.Text;

namespace BeautyConnect.Infrastructure.Services;

public static class EsewaSignatureHelper
{
    public static string GenerateSignature(
        IReadOnlyList<string> signedFieldNames,
        IReadOnlyDictionary<string, string> fieldValues,
        string secretKey)
    {
        ArgumentNullException.ThrowIfNull(signedFieldNames);
        ArgumentNullException.ThrowIfNull(fieldValues);

        if (signedFieldNames.Count == 0)
        {
            throw new ArgumentException(
                "At least one signed field is required.",
                nameof(signedFieldNames));
        }

        return GenerateSignatureFromMessage(
            BuildMessage(signedFieldNames, fieldValues),
            secretKey);
    }

    public static string GenerateSignatureFromMessage(string message, string secretKey)
    {
        ArgumentNullException.ThrowIfNull(message);
        ArgumentException.ThrowIfNullOrWhiteSpace(secretKey);

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToBase64String(hash);
    }

    public static string BuildMessage(
        IReadOnlyList<string> signedFieldNames,
        IReadOnlyDictionary<string, string> fieldValues)
    {
        ArgumentNullException.ThrowIfNull(signedFieldNames);
        ArgumentNullException.ThrowIfNull(fieldValues);

        if (signedFieldNames.Count == 0)
        {
            throw new ArgumentException(
                "At least one signed field is required.",
                nameof(signedFieldNames));
        }

        return string.Join(
            ",",
            signedFieldNames.Select(fieldName =>
            {
                if (string.IsNullOrWhiteSpace(fieldName))
                {
                    throw new ArgumentException(
                        "Signed field names cannot be empty.",
                        nameof(signedFieldNames));
                }

                if (!fieldValues.TryGetValue(fieldName, out var value))
                {
                    throw new ArgumentException(
                        $"A value for signed field '{fieldName}' is required.",
                        nameof(fieldValues));
                }

                return $"{fieldName}={value}";
            }));
    }
}
