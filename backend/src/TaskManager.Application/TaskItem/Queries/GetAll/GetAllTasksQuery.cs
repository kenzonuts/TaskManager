using MediatR;
using TaskManager.Application.TaskItem.Dtos;

namespace TaskManager.Application.TaskItem.Queries.GetAll
{
    public class GetAllTasksQuery : IRequest<IEnumerable<GetByUserDto>>
    {
    }
}
