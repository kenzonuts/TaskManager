namespace TaskManager.Domain.Data
{
    public class Reminder
    {
        public Guid ReminderId { get; set; }
        public Guid TaskId { get; set; }
        public DateTime RemindAt { get; set; }
        public bool IsSent { get; set; }
        public TaskItem Task { get; set; } = null!;
    }
}