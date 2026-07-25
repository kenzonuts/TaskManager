using MediatR;

namespace TaskManager.Application.Note.Command.Update
{
    public class UpdateNoteCommand : IRequest<Unit>
    {
        public Guid NoteId { get; set; }
        public string Content { get; set; } = null!;
    }
}
