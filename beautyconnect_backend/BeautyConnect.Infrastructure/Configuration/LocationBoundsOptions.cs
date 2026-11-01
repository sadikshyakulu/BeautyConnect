namespace BeautyConnect.Infrastructure.Configuration;

public sealed class LocationBoundsOptions
{
    public bool Enabled { get; set; } = true;
    public double MinLatitude { get; set; } = 26.3;
    public double MaxLatitude { get; set; } = 30.5;
    public double MinLongitude { get; set; } = 80.0;
    public double MaxLongitude { get; set; } = 88.3;
}
