namespace NebulaCore.Domain.Data
{
    public class Category
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public Guid UserId { get; set; }

        public User User { get; set; } = null!;
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}