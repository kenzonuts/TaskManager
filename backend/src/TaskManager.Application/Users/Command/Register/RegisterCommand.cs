using MediatR;
using TaskManager.Application.Users.Dtos;

namespace TaskManager.Application.Users.Command.Register
{
    public class RegisterCommand : IRequest<AuthResultDto>
    {
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
