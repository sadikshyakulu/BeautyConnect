namespace BeautyConnect.Core.Enums;

public enum UserRole
{
    Customer,
    Professional,
    Admin
}

public enum VerificationStatus
{
    Pending,
    Approved,
    Rejected
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}

public enum DisputeStatus
{
    Open,
    UnderReview,
    Resolved,
    Dismissed
}
