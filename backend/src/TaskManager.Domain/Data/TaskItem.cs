using System.ComponentModel.DataAnnotations;
using TaskManager.Domain.Enum;

namespace TaskManager.Domain.Data
{
    public class TaskItem
    {
        [Key]
        public Guid TaskId { get; set; }

        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public PriorityLevel Priority { get; set; }
        public Guid UserId { get; set; }
        public Guid? CategoryId { get; set; }

        public User User { get; set; } = null!;
        public Category? Category { get; set; }
        public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    }

}
