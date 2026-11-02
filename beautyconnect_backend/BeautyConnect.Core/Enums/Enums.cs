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

public enum PaymentIntentStatus
{
    Pending,
    Completed,
    Cancelled
}

public enum RefundStatus
{
    NotRequested,
    Requested,
    Refunded
}

public enum DisputeStatus
{
    Open,
    UnderReview,
    Resolved,
    Dismissed
}

public enum PayoutStatus
{
    NotDue,
    Available,
    Requested,
    Paid
}

public enum PayoutRequestStatus
{
    Requested,
    Paid,
    Rejected
}
