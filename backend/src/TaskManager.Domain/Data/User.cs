namespace TaskManager.Domain.Data
{
    public class User
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        /// <summary>Target number of tasks to complete per week (default 20).</summary>
        public int WeeklyGoal { get; set; } = 20;

        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<Project> Projects { get; set; } = new List<Project>();
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Note> Notes { get; set; } = new List<Note>();
    }
}
