using BeautyConnect.Core.Interfaces;
using Microsoft.AspNetCore.DataProtection;

namespace BeautyConnect.Infrastructure.Security;

public sealed class DataProtectionPayoutDetailsProtector : IPayoutDetailsProtector
{
    private readonly IDataProtector _protector;

    public DataProtectionPayoutDetailsProtector(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("BeautyConnect.PayoutAccountNumber.v1");
    }

    public string Protect(string accountNumber) => _protector.Protect(accountNumber);

    public string Unprotect(string protectedAccountNumber) => _protector.Unprotect(protectedAccountNumber);

    public string Mask(string accountNumber)
    {
        var visibleDigits = accountNumber.Length <= 4 ? accountNumber : accountNumber[^4..];
        return $"•••• {visibleDigits}";
    }
}
