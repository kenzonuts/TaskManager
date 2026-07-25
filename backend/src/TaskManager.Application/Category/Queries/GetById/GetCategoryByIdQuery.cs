using MediatR;

namespace TaskManager.Application.Category.Queries.GetById
{
    public class GetCategoryByIdQuery : IRequest<Domain.Data.Category>
    {
        public Guid CategoryId { get; set; }
    }
}