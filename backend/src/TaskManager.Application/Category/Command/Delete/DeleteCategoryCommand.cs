using MediatR;

namespace TaskManager.Application.Category.Command.Delete
{
    public class DeleteCategoryCommand : IRequest<Unit>
    {
        public Guid CategoryId { get; set; }
    }
}