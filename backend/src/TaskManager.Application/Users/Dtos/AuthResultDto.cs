namespace TaskManager.Application.Users.Dtos
{
    public class AuthResultDto
    {
        public string Token { get; set; } = default!;
        public Guid UserId { get; set; }
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
    }
}
