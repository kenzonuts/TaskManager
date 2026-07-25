using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Moq;
using TaskManager.Application.Users.Command.Login;
using TaskManager.Domain.Data;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Tests;

public class LoginCommandHandlerTests
{
    private static IConfiguration CreateJwtConfig()
    {
        var config = new Mock<IConfiguration>();
        config.Setup(c => c["Jwt:Key"]).Returns("taskmanager-test-secret-key-32chars!");
        config.Setup(c => c["Jwt:Issuer"]).Returns("TaskManager");
        config.Setup(c => c["Jwt:Audience"]).Returns("TaskManager");
        return config.Object;
    }

    [Fact]
    public async Task Handle_ValidPassword_ReturnsAuthResult()
    {
        var userId = Guid.NewGuid();
        var password = "Secret1!";
        var user = new User
        {
            UserId = userId,
            Username = "alice",
            Email = "alice@example.com",
            Password = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow
        };

        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync("alice@example.com")).ReturnsAsync(user);

        var handler = new LoginCommandHandler(repo.Object, CreateJwtConfig());
        var result = await handler.Handle(
            new LoginCommand { Email = "alice@example.com", Password = password },
            CancellationToken.None);

        Assert.Equal(userId, result.UserId);
        Assert.Equal("alice", result.Username);
        Assert.Equal("alice@example.com", result.Email);
        Assert.Equal(20, result.WeeklyGoal);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
    }

    [Fact]
    public async Task Handle_InvalidPassword_Throws()
    {
        var user = new User
        {
            UserId = Guid.NewGuid(),
            Username = "alice",
            Email = "alice@example.com",
            Password = BCrypt.Net.BCrypt.HashPassword("Secret1!"),
            CreatedAt = DateTime.UtcNow
        };

        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync("alice@example.com")).ReturnsAsync(user);

        var handler = new LoginCommandHandler(repo.Object, CreateJwtConfig());

        await Assert.ThrowsAsync<InvalidPasswordException>(() =>
            handler.Handle(
                new LoginCommand { Email = "alice@example.com", Password = "WrongPass1!" },
                CancellationToken.None));
    }

    [Fact]
    public async Task Handle_UnknownEmail_Throws()
    {
        var repo = new Mock<IUserRepository>();
        repo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var handler = new LoginCommandHandler(repo.Object, CreateJwtConfig());

        await Assert.ThrowsAsync<UserNotFoundException>(() =>
            handler.Handle(
                new LoginCommand { Email = "missing@example.com", Password = "Secret1!" },
                CancellationToken.None));
    }
}

internal static class TestHttp
{
    public static IHttpContextAccessor ForUser(Guid userId)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) },
            authenticationType: "Test");
        return new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }
}
