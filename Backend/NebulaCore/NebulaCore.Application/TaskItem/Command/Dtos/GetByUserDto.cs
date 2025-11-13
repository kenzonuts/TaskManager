
using NebulaCore.Domain.Enum;

namespace NebulaCore.Application.TaskItem.Command.Dtos
{
    public class GetByUserDto
    {
        public Guid TaskId { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public PriorityLevel Priority { get; set; }
        public bool IsCompleted { get; set; }
        public Guid UserId { get; set; }
        public Guid? CategoryId { get; set; }
    }
}