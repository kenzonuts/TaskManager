
namespace NebulaCore.Application.Reminder.Command.Delete
{
    public class DeleteReminderCommand
    {
        public Guid ReminderId { get; set; }

        public DeleteReminderCommand(Guid reminderId)
        {
            ReminderId = reminderId;
        }
    }
}