using MediatR;
using TaskManager.Application.Project.Dtos;

namespace TaskManager.Application.Project.Queries.GetById
{
    public class GetProjectByIdQuery : IRequest<ProjectDto>
    {
        public Guid ProjectId { get; set; }
    }
}
