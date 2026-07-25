using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TaskManager.Application.Users.Dtos;
using TaskManager.Domain.Data;

namespace TaskManager.Application.Users
{
    public static class JwtTokenGenerator
    {
        public static AuthResultDto CreateAuthResult(User user, IConfiguration config)
        {
            var jwtKey = config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key tidak dikonfigurasi");
            var jwtIssuer = config["Jwt:Issuer"] ?? "TaskManager";
            var jwtAudience = config["Jwt:Audience"] ?? "TaskManager";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new AuthResultDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email
            };
        }
    }
}
