namespace BeautyConnect.Core.Interfaces;

public interface IPayoutDetailsProtector
{
    string Protect(string accountNumber);
    string Unprotect(string protectedAccountNumber);
    string Mask(string accountNumber);
}
