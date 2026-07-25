using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Reminder.Command.Update
{
    public class UpdateReminderCommandHandler : IRequestHandler<UpdateReminderCommand>
    {
        private readonly IReminderRepository _reminderRepo;
        private readonly IRepositoryTaskItem _taskRepo;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateReminderCommandHandler(
            IReminderRepository reminderRepo,
            IRepositoryTaskItem taskRepo,
            IHttpContextAccessor httpContextAccessor)
        {
            _reminderRepo = reminderRepo;
            _taskRepo = taskRepo;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(UpdateReminderCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            if (request.RemindAt <= DateTime.UtcNow)
                throw new InvalidOperationException("Waktu reminder tidak boleh di masa lalu.");

            var reminder = await _reminderRepo.GetByIdAsync(request.ReminderId)
                ?? throw new KeyNotFoundException("Reminder tidak ditemukan.");

            var task = await _taskRepo.GetByIdAsync(reminder.TaskId);
            if (task == null || task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("Reminder ini bukan milik Anda.");

            reminder.RemindAt = request.RemindAt.ToUniversalTime();
            reminder.IsSent = false;

            await _reminderRepo.UpdateAsync(reminder);
            await _reminderRepo.SaveChangesAsync();
        }
    }
}
