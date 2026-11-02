namespace BeautyConnect.Core.DTOs;

public static class PayoutCalculator
{
    public static (decimal Commission, decimal ProfessionalPayout) Calculate(
        decimal servicePrice,
        decimal commissionRate)
    {
        if (servicePrice < 0m)
        {
            throw new ArgumentOutOfRangeException(nameof(servicePrice));
        }

        if (commissionRate is < 0m or > 1m)
        {
            throw new ArgumentOutOfRangeException(nameof(commissionRate));
        }

        var commission = decimal.Round(
            servicePrice * commissionRate,
            2,
            MidpointRounding.AwayFromZero);
        return (commission, servicePrice - commission);
    }
}
