using MediatR;

namespace TaskManager.Application.Note.Command.Delete
{
    public class DeleteNoteCommand : IRequest<Unit>
    {
        public Guid NoteId { get; set; }
    }
}
