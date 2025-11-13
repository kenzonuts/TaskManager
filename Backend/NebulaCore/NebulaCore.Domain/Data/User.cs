namespace NebulaCore.Domain.Data
{
    public class User
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}