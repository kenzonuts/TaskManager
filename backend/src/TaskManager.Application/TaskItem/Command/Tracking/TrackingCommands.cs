using MediatR;

namespace TaskManager.Application.TaskItem.Command.Tracking
{
    public class StartTrackingCommand : IRequest<Unit>
    {
        public Guid TaskId { get; set; }
    }

    public class StopTrackingCommand : IRequest<Unit>
    {
        public Guid TaskId { get; set; }
    }
}
