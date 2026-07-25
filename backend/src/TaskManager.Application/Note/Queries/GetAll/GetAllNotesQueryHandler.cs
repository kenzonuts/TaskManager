using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Application.Note.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Note.Queries.GetAll
{
    public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, IEnumerable<NoteDto>>
    {
        private readonly INoteRepository _noteRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetAllNotesQueryHandler(
            INoteRepository noteRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _noteRepository = noteRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<NoteDto>> Handle(
            GetAllNotesQuery request,
            CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var notes = await _noteRepository.GetByUserIdAsync(Guid.Parse(userId));

            return notes.Select(n => new NoteDto
            {
                NoteId = n.NoteId,
                UserId = n.UserId,
                Content = n.Content,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            });
        }
    }
}
