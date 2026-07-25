using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Note.Command.Delete
{
    public class DeleteNoteCommandHandler : IRequestHandler<DeleteNoteCommand, Unit>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteNoteCommandHandler(
            INoteRepository noteRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _noteRepository = noteRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var note = await _noteRepository.GetByIdAsync(request.NoteId);
            if (note == null)
                throw new KeyNotFoundException("Note not found");

            if (note.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot delete this note");

            await _noteRepository.DeleteAsync(request.NoteId);
            return Unit.Value;
        }
    }
}
