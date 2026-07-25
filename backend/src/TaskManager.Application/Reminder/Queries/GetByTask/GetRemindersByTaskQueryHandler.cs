using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Application.Reminder.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Reminder.Queries.GetByTask
{
    public class GetRemindersByTaskQueryHandler
        : IRequestHandler<GetRemindersByTaskQuery, IReadOnlyList<ReminderDto>>
    {
        private readonly IReminderRepository _reminderRepo;
        private readonly IRepositoryTaskItem _taskRepo;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetRemindersByTaskQueryHandler(
            IReminderRepository reminderRepo,
            IRepositoryTaskItem taskRepo,
            IHttpContextAccessor httpContextAccessor)
        {
            _reminderRepo = reminderRepo;
            _taskRepo = taskRepo;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IReadOnlyList<ReminderDto>> Handle(
            GetRemindersByTaskQuery request,
            CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var task = await _taskRepo.GetByIdAsync(request.TaskId);
            if (task == null || task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("Task ini bukan milik Anda.");

            var reminders = await _reminderRepo.GetByTaskIdAsync(request.TaskId);
            return reminders
                .Select(r => new ReminderDto
                {
                    ReminderId = r.ReminderId,
                    TaskId = r.TaskId,
                    RemindAt = r.RemindAt,
                    IsSent = r.IsSent
                })
                .ToList();
        }
    }
}
