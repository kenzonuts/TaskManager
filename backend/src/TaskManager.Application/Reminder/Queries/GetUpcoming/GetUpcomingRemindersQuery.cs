using MediatR;

namespace TaskManager.Application.Reminder.Queries.GetUpcoming
{
    public class UpcomingReminderDto
    {
        public Guid ReminderId { get; set; }
        public Guid TaskId { get; set; }
        public string TaskTitle { get; set; } = null!;
        public DateTime RemindAt { get; set; }
    }

    public class GetUpcomingRemindersQuery : IRequest<IEnumerable<UpcomingReminderDto>>
    {
    }
}
