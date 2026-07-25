using MediatR;

namespace TaskManager.Application.Project.Command.Delete
{
    public class DeleteProjectCommand : IRequest<Unit>
    {
        public Guid ProjectId { get; set; }
    }
}
