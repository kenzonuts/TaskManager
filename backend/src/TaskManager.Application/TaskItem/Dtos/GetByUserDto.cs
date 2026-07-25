using TaskManager.Domain.Enum;

namespace TaskManager.Application.TaskItem.Dtos
{
    public class GetByUserDto
    {
        public Guid TaskId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public PriorityLevel Priority { get; set; }
        public bool IsCompleted { get; set; }
        public Guid UserId { get; set; }
        public Guid? CategoryId { get; set; }
        public int? EstimatedMinutes { get; set; }
        public int? ScheduleStartMinutes { get; set; }
        public int? ScheduleEndMinutes { get; set; }
        public bool IsPinnedFocus { get; set; }
        public DateTime? TrackingStartedAt { get; set; }
        public int TrackingElapsedSeconds { get; set; }
    }
}
