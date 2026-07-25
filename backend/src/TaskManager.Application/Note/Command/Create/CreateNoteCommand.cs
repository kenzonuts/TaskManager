using MediatR;

namespace TaskManager.Application.Note.Command.Create
{
    public class CreateNoteCommand : IRequest<Guid>
    {
        public string Content { get; set; } = null!;
    }
}
