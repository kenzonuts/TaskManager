namespace TaskManager.Application.Reminder.Command.Update
{
    public class UpdateReminderCommand
    {
        public Guid ReminderId { get; set; }
        public DateTime RemindAt { get; set; }

        public UpdateReminderCommand(Guid reminderId, DateTime remindAt)
        {
            ReminderId = reminderId;
            RemindAt = remindAt;
        }
    }
}