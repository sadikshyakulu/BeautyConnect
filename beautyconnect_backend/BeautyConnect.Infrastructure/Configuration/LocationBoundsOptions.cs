namespace BeautyConnect.Infrastructure.Configuration;

public sealed class LocationBoundsOptions
{
    public bool Enabled { get; set; } = true;
    public double MinLat { get; set; } = 26.3;
    public double MaxLat { get; set; } = 30.5;
    public double MinLng { get; set; } = 80.0;
    public double MaxLng { get; set; } = 88.3;
}
