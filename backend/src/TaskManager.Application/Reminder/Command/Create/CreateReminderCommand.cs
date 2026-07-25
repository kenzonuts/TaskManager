using MediatR;

namespace TaskManager.Application.Reminder.Command.Create
{
    public class CreateReminderCommand : IRequest<Guid>
    {
        public Guid TaskId { get; set; }
        public DateTime RemindAt { get; set; }
    }
}
