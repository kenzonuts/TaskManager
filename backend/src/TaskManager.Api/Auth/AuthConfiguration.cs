using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using TaskManager.Domain.Data;
using TaskManager.Domain.Repositories;

namespace TaskManager.Api.Auth
{
    public static class AuthConfiguration
    {
        public const string ProviderCustom = "Custom";
        public const string ProviderSupabase = "Supabase";

        public static void AddTaskManagerAuth(this IServiceCollection services, IConfiguration config)
        {
            var provider = config["Auth:Provider"] ?? ProviderCustom;

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.MapInboundClaims = false;
                    options.TokenValidationParameters = BuildValidationParameters(config, provider);
                    options.Events = new JwtBearerEvents
                    {
                        OnTokenValidated = async ctx =>
                        {
                            MapNameIdentifier(ctx.Principal);

                            if (!string.Equals(provider, ProviderSupabase, StringComparison.OrdinalIgnoreCase))
                                return;

                            var userRepo = ctx.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
                            await EnsureSupabaseUserAsync(ctx.Principal, userRepo);
                        }
                    };
                });

            services.AddAuthorization();
        }

        private static void MapNameIdentifier(ClaimsPrincipal? principal)
        {
            if (principal?.Identity is not ClaimsIdentity identity) return;

            if (identity.FindFirst(ClaimTypes.NameIdentifier) != null) return;

            var sub = identity.FindFirst("sub")?.Value;
            if (!string.IsNullOrWhiteSpace(sub))
                identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, sub));
        }

        private static TokenValidationParameters BuildValidationParameters(IConfiguration config, string provider)
        {
            if (string.Equals(provider, ProviderSupabase, StringComparison.OrdinalIgnoreCase))
            {
                var jwtSecret = config["Supabase:JwtSecret"]
                    ?? config["Jwt:Key"]
                    ?? throw new InvalidOperationException(
                        "Supabase JWT secret missing. Set Supabase:JwtSecret (or Jwt:Key) in User Secrets.");

                var projectUrl = (config["Supabase:Url"] ?? "").TrimEnd('/');
                if (string.IsNullOrWhiteSpace(projectUrl))
                    throw new InvalidOperationException("Supabase:Url is required when Auth:Provider=Supabase.");

                return new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = $"{projectUrl}/auth/v1",
                    ValidateAudience = true,
                    ValidAudience = "authenticated",
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                    NameClaimType = "sub",
                };
            }

            var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key tidak dikonfigurasi");
            var jwtIssuer = config["Jwt:Issuer"] ?? "TaskManager";
            var jwtAudience = config["Jwt:Audience"] ?? "TaskManager";

            return new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
            };
        }

        public static async Task EnsureSupabaseUserAsync(
            ClaimsPrincipal? principal,
            IUserRepository userRepository)
        {
            if (principal == null) return;

            var sub = principal.FindFirstValue("sub")
                ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = principal.FindFirstValue("email")
                ?? principal.FindFirstValue(ClaimTypes.Email);

            if (string.IsNullOrWhiteSpace(sub) || string.IsNullOrWhiteSpace(email))
                return;

            if (!Guid.TryParse(sub, out var userId))
                return;

            var existing = await userRepository.GetByIdAsync(userId);
            if (existing != null) return;

            var byEmail = await userRepository.GetByEmailAsync(email);
            if (byEmail != null) return;

            var usernameClaim = principal.Claims.FirstOrDefault(c => c.Type == "username")?.Value;
            var username = !string.IsNullOrWhiteSpace(usernameClaim)
                ? usernameClaim
                : email.Split('@')[0];

            if (username.Length > 50)
                username = username[..50];

            await userRepository.AddAsync(new User
            {
                UserId = userId,
                Email = email,
                Username = username,
                Password = "SUPABASE_AUTH",
                CreatedAt = DateTime.UtcNow,
                WeeklyGoal = 20
            });
        }
    }
}
