using MediatR;
using TaskManager.Application.Project.Dtos;

namespace TaskManager.Application.Project.Queries.GetAll
{
    public class GetAllProjectsQuery : IRequest<IEnumerable<ProjectDto>>
    {
    }
}
