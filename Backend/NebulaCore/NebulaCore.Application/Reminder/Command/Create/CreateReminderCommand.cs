namespace NebulaCore.Application.Reminder.Command.Create
{
    public class CreateReminderCommand
    {
        public Guid TaskId { get; set; }
        public DateTime RemindAt { get; set; }
    }
}