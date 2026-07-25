using MediatR;

namespace TaskManager.Application.TaskItem.Command.PinFocus
{
    public class PinFocusCommand : IRequest<Unit>
    {
        public Guid TaskId { get; set; }
        public bool IsPinned { get; set; }
    }
}
