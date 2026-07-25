namespace TaskManager.Application.Category.Dtos
{
    public class CategoryDto
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = null!;
        public Guid UserId { get; set; }
    }
}
