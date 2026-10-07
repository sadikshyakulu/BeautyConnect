using System.Text;
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

// Database Connection with Pomelo MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<BeautyConnectDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString), mysqlOptions =>
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
