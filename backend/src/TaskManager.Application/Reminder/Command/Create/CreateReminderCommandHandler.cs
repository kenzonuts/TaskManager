using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Reminder.Command.Create
{
    public class CreateReminderCommandHandler : IRequestHandler<CreateReminderCommand, Guid>
    {
        private readonly IReminderRepository _repo;
        private readonly IRepositoryTaskItem _taskRepo;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateReminderCommandHandler(
            IReminderRepository repo,
            IRepositoryTaskItem taskRepo,
            IHttpContextAccessor httpContextAccessor)
        {
            _repo = repo;
            _taskRepo = taskRepo;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateReminderCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            if (request.RemindAt <= DateTime.UtcNow)
                throw new InvalidOperationException("Waktu reminder tidak boleh di masa lalu.");

            var task = await _taskRepo.GetByIdAsync(request.TaskId);
            if (task == null || task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("Task ini bukan milik Anda.");

            var reminder = new Domain.Data.Reminder
            {
                ReminderId = Guid.NewGuid(),
                TaskId = request.TaskId,
                RemindAt = request.RemindAt.ToUniversalTime(),
                IsSent = false
            };

            await _repo.AddAsync(reminder);
            await _repo.SaveChangesAsync();
            return reminder.ReminderId;
        }
    }
}
