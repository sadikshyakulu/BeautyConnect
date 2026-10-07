namespace BeautyConnect.Infrastructure.Configuration;

public sealed class EsewaOptions
{
    public const string SectionName = "Esewa";

    public string ProductCode { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string FormUrl { get; set; } = string.Empty;
    public string StatusCheckUrl { get; set; } = string.Empty;
    public string SuccessUrl { get; set; } = string.Empty;
    public string FailureUrl { get; set; } = string.Empty;
    public decimal CommissionRate { get; set; } = 0.05m;
}
