using MediatR;

namespace TaskManager.Application.Users.Command.Update
{
    public class UpdatePasswordCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
        public string Password { get; set; } = default!;
    }
}
