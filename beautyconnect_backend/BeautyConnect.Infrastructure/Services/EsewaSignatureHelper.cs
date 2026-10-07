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
        ArgumentException.ThrowIfNullOrWhiteSpace(secretKey);

        if (signedFieldNames.Count == 0)
        {
            throw new ArgumentException(
                "At least one signed field is required.",
                nameof(signedFieldNames));
        }

        var message = string.Join(
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

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(message));
        return Convert.ToBase64String(hash);
    }
}
