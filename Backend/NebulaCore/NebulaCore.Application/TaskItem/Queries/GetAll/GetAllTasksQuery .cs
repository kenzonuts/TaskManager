using MediatR;
using NebulaCore.Application.TaskItem.Command.Dtos;

namespace NebulaCore.Application.TaskItem.Queries.GetAll
{
    public class GetAllTasksQuery : IRequest<IEnumerable<GetByUserDto>>
    {
    }
}
