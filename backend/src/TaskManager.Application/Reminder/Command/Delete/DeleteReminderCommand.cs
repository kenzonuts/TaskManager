using MediatR;

namespace TaskManager.Application.Reminder.Command.Delete
{
    public class DeleteReminderCommand : IRequest
    {
        public Guid ReminderId { get; set; }
    }
}
