using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Reminder.Command.Delete
{
    public class DeleteReminderCommandHandler : IRequestHandler<DeleteReminderCommand>
    {
        private readonly IReminderRepository _repo;
        private readonly IRepositoryTaskItem _taskRepo;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteReminderCommandHandler(
            IReminderRepository repo,
            IRepositoryTaskItem taskRepo,
            IHttpContextAccessor httpContextAccessor)
        {
            _repo = repo;
            _taskRepo = taskRepo;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(DeleteReminderCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var reminder = await _repo.GetByIdAsync(request.ReminderId)
                ?? throw new KeyNotFoundException("Reminder tidak ditemukan.");

            var task = await _taskRepo.GetByIdAsync(reminder.TaskId);
            if (task == null || task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("Reminder ini bukan milik Anda.");

            await _repo.DeleteAsync(request.ReminderId);
            await _repo.SaveChangesAsync();
        }
    }
}
