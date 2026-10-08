using System.Text;
using BeautyConnect.Core.Entities;
using BeautyConnect.Core.Enums;
using BeautyConnect.Api.Filters;
using BeautyConnect.Api.Middleware;
using BeautyConnect.Core.Interfaces;
using BeautyConnect.Infrastructure.Data;
using BeautyConnect.Infrastructure.Configuration;
using BeautyConnect.Infrastructure.Security;
using BeautyConnect.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Use SQLite by default for local development so the API can boot even when MySQL is not running yet.
// Switching to MySQL is still supported by setting Database:Provider=MySql and a valid DefaultConnection.
var databaseProvider = builder.Configuration["Database:Provider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var sqliteConnectionString = builder.Configuration.GetConnectionString("SqliteConnection") ?? "Data Source=beautyconnect.db";
var mysqlVersionText = builder.Configuration["Database:MySqlVersion"] ?? "8.0.36";
var mysqlVersion = ServerVersion.Parse(mysqlVersionText);

builder.Services.AddDbContext<BeautyConnectDbContext>((_, options) =>
{
    if (databaseProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlite(sqliteConnectionString);
        return;
    }

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("ConnectionStrings:DefaultConnection is missing or empty.");
    }

    options.UseMySql(connectionString, mysqlVersion, mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });
});

// Dependency Injection
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();
var webRootPath = builder.Environment.WebRootPath ?? Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(webRootPath);
builder.Services.AddScoped<IProfessionalProfileService>(serviceProvider =>
    new ProfessionalProfileService(
        serviceProvider.GetRequiredService<BeautyConnectDbContext>(),
        Path.Combine(webRootPath, "uploads", "portfolio")));
builder.Services.AddScoped<IAvailabilityService, AvailabilityService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.Configure<EsewaOptions>(builder.Configuration.GetSection(EsewaOptions.SectionName));
builder.Services.AddHttpClient<IPaymentService, PaymentService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "BeautyConnectSuperSecureJwtSecretKeyWithMoreThan256BitsLengthForSafety!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "BeautyConnectApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "BeautyConnectClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // set to true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireProfessional", policy => policy.RequireRole("Professional"));
    options.AddPolicy("RequireCustomer", policy => policy.RequireRole("Customer"));
});

// CORS for Vite frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("BeautyConnectCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // needed for HttpOnly cookies
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<AuthorizeOperationFilter>();
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter a JWT access token."
    });
});

var app = builder.Build();

// Apply schema changes automatically only in Development; production migrations should be reviewed and deployed separately.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BeautyConnectDbContext>();
    db.Database.Migrate();
}

await SeedAdminAsync(app);

// Global Exception Handler Middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("BeautyConnectCorsPolicy");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(webRootPath)
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static async Task SeedAdminAsync(WebApplication app)
{
    var email = app.Configuration["AdminSeed:Email"];
    var password = app.Configuration["AdminSeed:Password"];

    // Local test credentials are intentionally available only in Development.
    if (app.Environment.IsDevelopment())
    {
        if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(password))
        {
            email = "admin.test@beautyconnect.local";
            password = "BeautyConnect_TestAdmin_2026!";
        }
    }

    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BeautyConnectDbContext>();
    if (await dbContext.Users.AnyAsync(user => user.Role == UserRole.Admin))
    {
        return;
    }

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
    {
        if (!app.Environment.IsDevelopment())
        {
            throw new InvalidOperationException(
                "No Admin account exists. Configure AdminSeed:Email and AdminSeed:Password before starting.");
        }

        throw new InvalidOperationException(
            "Configure both AdminSeed:Email and AdminSeed:Password, or remove both to use the Development test credentials.");
    }

    var normalizedEmail = email.Trim().ToLowerInvariant();
    if (await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail))
    {
        throw new InvalidOperationException(
            $"Cannot seed the Admin account because {normalizedEmail} is already registered with another role.");
    }

    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    dbContext.Users.Add(new User
    {
        Email = normalizedEmail,
        PasswordHash = passwordHasher.HashPassword(password),
        Role = UserRole.Admin,
        CreatedAt = DateTime.UtcNow
    });
    await dbContext.SaveChangesAsync();

    app.Logger.LogInformation("Seeded the configured Admin account {Email}.", normalizedEmail);
}
