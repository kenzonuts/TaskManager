using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Reminder.Queries.GetUpcoming
{
    public class GetUpcomingRemindersQueryHandler
        : IRequestHandler<GetUpcomingRemindersQuery, IEnumerable<UpcomingReminderDto>>
    {
        private readonly IReminderRepository _reminderRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetUpcomingRemindersQueryHandler(
            IReminderRepository reminderRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _reminderRepository = reminderRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<UpcomingReminderDto>> Handle(
            GetUpcomingRemindersQuery request,
            CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var from = DateTime.UtcNow.AddHours(-1);
            var to = DateTime.UtcNow.AddDays(7);
            var reminders = await _reminderRepository.GetUpcomingByUserIdAsync(
                Guid.Parse(userId), from, to);

            return reminders.Select(r => new UpcomingReminderDto
            {
                ReminderId = r.ReminderId,
                TaskId = r.TaskId,
                TaskTitle = r.Task?.Title ?? "Task",
                RemindAt = r.RemindAt
            });
        }
    }
}
