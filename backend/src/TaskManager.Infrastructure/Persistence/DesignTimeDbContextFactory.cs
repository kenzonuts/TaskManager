using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TaskManager.Infrastructure.Persistence
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        // Must match UserSecretsId in TaskManager.Api.csproj
        private const string ApiUserSecretsId = "taskmanager-api-a3f8c2e1-4b7d-4e9a-9c1f-8d2e6b5a0f11";

        public AppDbContext CreateDbContext(string[] args)
        {
            var apiPath = ResolveApiProjectPath();

            var configBuilder = new ConfigurationBuilder()
                .SetBasePath(apiPath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables();

            // Load API User Secrets by id (design-time factory lives in Infrastructure).
            configBuilder.AddJsonFile(
                Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "Microsoft",
                    "UserSecrets",
                    ApiUserSecretsId,
                    "secrets.json"),
                optional: true);

            // Linux / macOS user-secrets path
            configBuilder.AddJsonFile(
                Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                    ".microsoft",
                    "usersecrets",
                    ApiUserSecretsId,
                    "secrets.json"),
                optional: true);

            var config = configBuilder.Build();

            var connectionString =
                config.GetConnectionString("DefaultConnection")
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? Environment.GetEnvironmentVariable("TASKMANAGER_CONNECTION_STRING");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "Connection string not found. Set User Secret " +
                    "'ConnectionStrings:DefaultConnection' on TaskManager.Api " +
                    "(see backend/SETUP.md), or export ConnectionStrings__DefaultConnection.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new AppDbContext(optionsBuilder.Options);
        }

        private static string ResolveApiProjectPath()
        {
            var cwd = Directory.GetCurrentDirectory();
            var candidates = new[]
            {
                Path.Combine(cwd, "TaskManager.Api"),
                Path.Combine(cwd, "..", "TaskManager.Api"),
                Path.Combine(cwd, "backend", "src", "TaskManager.Api"),
            };

            foreach (var candidate in candidates)
            {
                var full = Path.GetFullPath(candidate);
                if (File.Exists(Path.Combine(full, "TaskManager.Api.csproj")))
                    return full;
            }

            throw new DirectoryNotFoundException(
                "Could not locate TaskManager.Api for design-time config. " +
                "Run from backend/src or set ConnectionStrings__DefaultConnection.");
        }
    }
}
