using MediatR;

namespace TaskManager.Application.Category.Command.Create
{
    public class CreateCategoryCommand : IRequest<Guid>
    {
        public string Name { get; set; } = null!;
    }
}