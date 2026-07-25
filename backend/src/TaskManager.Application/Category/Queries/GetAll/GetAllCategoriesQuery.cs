using MediatR;
using TaskManager.Application.Category.Dtos;

namespace TaskManager.Application.Category.Queries.GetAll
{
    public class GetAllCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
    {
    }
}
