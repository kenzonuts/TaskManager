using MediatR;

namespace TaskManager.Application.Users.Command.Login
{
    public class LoginCommand : IRequest<string>
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
