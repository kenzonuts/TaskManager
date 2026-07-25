using MediatR;

namespace TaskManager.Application.Project.Command.Update
{
    public class UpdateProjectCommand : IRequest<Unit>
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Color { get; set; }
    }
}
