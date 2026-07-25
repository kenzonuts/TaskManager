using MediatR;
using TaskManager.Application.TaskItem.Command.Dtos;

namespace TaskManager.Application.TaskItem.Queries.GetAll
{
    public class GetAllTasksQuery : IRequest<IEnumerable<GetByUserDto>>
    {
    }
}
