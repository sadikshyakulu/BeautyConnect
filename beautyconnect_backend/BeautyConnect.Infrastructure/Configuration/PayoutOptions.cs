namespace BeautyConnect.Infrastructure.Configuration;

public sealed class PayoutOptions
{
    public const string SectionName = "Payout";

    public decimal MinimumAmount { get; set; } = 500m;
    public int HoldHours { get; set; }
}
