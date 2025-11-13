using MediatR;
using NebulaCore.Application.Category.Dtos;

namespace NebulaCore.Application.Category.Queries.GetAll
{
    public class GetAllCategoriesQuery : IRequest<IEnumerable<CategoryDto>>
    {
    }
}
