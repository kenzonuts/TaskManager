using System.Net;
using System.Text.Json;
using FluentValidation;

namespace TaskManager.Api.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
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
                await WriteErrorAsync(context, ex);
            }
        }

        private async Task WriteErrorAsync(HttpContext context, Exception exception)
        {
            var (status, error) = exception switch
            {
                ValidationException validation => (
                    HttpStatusCode.BadRequest,
                    (object)new
                    {
                        error = "Validation failed",
                        details = validation.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
                    }),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, (object)new { error = exception.Message }),
                KeyNotFoundException => (HttpStatusCode.NotFound, (object)new { error = exception.Message }),
                InvalidOperationException => (HttpStatusCode.BadRequest, (object)new { error = exception.Message }),
                ArgumentException => (HttpStatusCode.BadRequest, (object)new { error = exception.Message }),
                _ => (HttpStatusCode.InternalServerError, (object)new { error = "An unexpected error occurred." })
            };

            if (status == HttpStatusCode.InternalServerError)
            {
                _logger.LogError(exception, "Unhandled exception");
            }
            else
            {
                _logger.LogWarning(exception, "Handled exception: {Message}", exception.Message);
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)status;
            await context.Response.WriteAsync(JsonSerializer.Serialize(error, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }
    }
}
