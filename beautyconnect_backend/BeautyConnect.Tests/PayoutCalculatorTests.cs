using BeautyConnect.Core.DTOs;
using Xunit;

namespace BeautyConnect.Tests;

public class PayoutCalculatorTests
{
    [Fact]
    public void CommissionAndProfessionalPayoutUseDecimalRounding()
    {
        var (commission, professionalPayout) = PayoutCalculator.Calculate(3500m, 0.05m);

        Assert.Equal(175m, commission);
        Assert.Equal(3325m, professionalPayout);
    }

    [Fact]
    public void CommissionRoundsMidpointsAwayFromZero()
    {
        var (commission, professionalPayout) = PayoutCalculator.Calculate(10.10m, 0.05m);

        Assert.Equal(0.51m, commission);
        Assert.Equal(9.59m, professionalPayout);
    }
}
