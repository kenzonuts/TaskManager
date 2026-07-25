namespace TaskManager.Application.Note.Dtos
{
    public class NoteDto
    {
        public Guid NoteId { get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
