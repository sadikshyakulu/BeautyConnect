using Microsoft.EntityFrameworkCore;
using BeautyConnect.Core.Entities;

namespace BeautyConnect.Infrastructure.Data;

public class BeautyConnectDbContext : DbContext
{
    public BeautyConnectDbContext(DbContextOptions<BeautyConnectDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    public DbSet<ProfessionalProfile> ProfessionalProfiles => Set<ProfessionalProfile>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Availability> Availabilities => Set<Availability>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Dispute> Disputes => Set<Dispute>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(30);
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CustomerProfile
        modelBuilder.Entity<CustomerProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.CustomerProfile)
                .HasForeignKey<CustomerProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ProfessionalProfile
        modelBuilder.Entity<ProfessionalProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithOne(u => u.ProfessionalProfile)
                .HasForeignKey<ProfessionalProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.VerificationStatus).HasConversion<string>().HasMaxLength(30);
            
            // Search indexes for sub-2s query requirement
            entity.HasIndex(e => e.VerificationStatus);
            entity.HasIndex(e => e.City);
            entity.HasIndex(e => e.RatingAverage);
            entity.HasIndex(e => new { e.VerificationStatus, e.RatingAverage });
        });

        // Service
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.Price);

            entity.HasOne(e => e.ProfessionalProfile)
                .WithMany(p => p.Services)
                .HasForeignKey(e => e.ProfessionalProfileId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Availability
        modelBuilder.Entity<Availability>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.ProfessionalProfile)
                .WithMany(p => p.Availabilities)
                .HasForeignKey(e => e.ProfessionalProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.ProfessionalProfileId, e.DayOfWeek });
            entity.HasIndex(e => new { e.ProfessionalProfileId, e.SpecificDate });
        });

        // Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TotalPrice).HasPrecision(10, 2);
            entity.Property(e => e.CommissionAmount).HasPrecision(10, 2);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);

            entity.HasOne(e => e.CustomerProfile)
                .WithMany(c => c.Bookings)
                .HasForeignKey(e => e.CustomerProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProfessionalProfile)
                .WithMany(p => p.Bookings)
                .HasForeignKey(e => e.ProfessionalProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Service)
                .WithMany(s => s.Bookings)
                .HasForeignKey(e => e.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.ProfessionalProfileId, e.ScheduledDateTime, e.Status });
        });

        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Booking)
                .WithOne(b => b.Review)
                .HasForeignKey<Review>(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.CustomerProfile)
                .WithMany(c => c.Reviews)
                .HasForeignKey(e => e.CustomerProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProfessionalProfile)
                .WithMany(p => p.Reviews)
                .HasForeignKey(e => e.ProfessionalProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.BookingId).IsUnique();
        });

        // Dispute
        modelBuilder.Entity<Dispute>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);

            entity.HasOne(e => e.Booking)
                .WithOne(b => b.Dispute)
                .HasForeignKey<Dispute>(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.RaisedByUser)
                .WithMany()
                .HasForeignKey(e => e.RaisedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
