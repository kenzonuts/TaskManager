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
        public Guid? ProjectId { get; set; }

        /// <summary>Estimated effort in minutes.</summary>
        public int? EstimatedMinutes { get; set; }

        /// <summary>Optional daily schedule start (local time-of-day as minutes from midnight).</summary>
        public int? ScheduleStartMinutes { get; set; }

        /// <summary>Optional daily schedule end (minutes from midnight).</summary>
        public int? ScheduleEndMinutes { get; set; }

        public bool IsPinnedFocus { get; set; }

        /// <summary>When non-null, time tracking is running.</summary>
        public DateTime? TrackingStartedAt { get; set; }

        /// <summary>Accumulated tracked seconds (paused sessions).</summary>
        public int TrackingElapsedSeconds { get; set; }

        public User User { get; set; } = null!;
        public Category? Category { get; set; }
        public Project? Project { get; set; }
        public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    }
}
