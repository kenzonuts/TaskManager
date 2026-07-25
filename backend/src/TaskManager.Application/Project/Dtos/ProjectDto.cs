namespace TaskManager.Application.Project.Dtos
{
    public class ProjectDto
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TaskCount { get; set; }
        public int CompletedTaskCount { get; set; }
    }
}
