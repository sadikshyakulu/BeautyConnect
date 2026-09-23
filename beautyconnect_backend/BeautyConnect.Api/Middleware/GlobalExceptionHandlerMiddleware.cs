using System.Net;
using System.Text.Json;

namespace BeautyConnect.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var correlationId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "Unhandled exception occurred. CorrelationId: {CorrelationId}", correlationId);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                status = 500,
                error = "InternalServerError",
                message = "An unexpected error occurred. Please try again later.",
                correlationId
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
