using MediatR;

namespace TaskManager.Application.Reminder.Command.Update
{
    public class UpdateReminderCommand : IRequest
    {
        public Guid ReminderId { get; set; }
        public DateTime RemindAt { get; set; }
    }
}
