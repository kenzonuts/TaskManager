namespace TaskManager.Application.Reminder.Dtos
{
    public class ReminderDto
    {
        public Guid ReminderId { get; set; }
        public Guid TaskId { get; set; }
        public DateTime RemindAt { get; set; }
        public bool IsSent { get; set; }
    }
}
