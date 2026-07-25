using MediatR;
using TaskManager.Application.Note.Dtos;

namespace TaskManager.Application.Note.Queries.GetAll
{
    public class GetAllNotesQuery : IRequest<IEnumerable<NoteDto>>
    {
    }
}
