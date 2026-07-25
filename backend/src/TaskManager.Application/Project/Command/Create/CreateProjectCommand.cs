using MediatR;

namespace TaskManager.Application.Project.Command.Create
{
    public class CreateProjectCommand : IRequest<Guid>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Color { get; set; }
    }
}
