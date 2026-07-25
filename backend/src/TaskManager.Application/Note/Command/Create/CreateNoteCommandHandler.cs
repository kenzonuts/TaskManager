using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Note.Command.Create
{
    public class CreateNoteCommandHandler : IRequestHandler<CreateNoteCommand, Guid>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateNoteCommandHandler(
            INoteRepository noteRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _noteRepository = noteRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var now = DateTime.UtcNow;
            var note = new Domain.Data.Note
            {
                NoteId = Guid.NewGuid(),
                UserId = Guid.Parse(userId),
                Content = request.Content.Trim(),
                CreatedAt = now,
                UpdatedAt = now
            };

            await _noteRepository.AddAsync(note);
            return note.NoteId;
        }
    }
}
