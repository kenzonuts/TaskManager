using MediatR;

namespace TaskManager.Application.Users.Command.Delete
{
    public class DeleteUserCommand : IRequest<bool>
    {
        public Guid UserId { get; set; }
    }
}