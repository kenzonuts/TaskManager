using MediatR;
using TaskManager.Application.Reminder.Dtos;

namespace TaskManager.Application.Reminder.Queries.GetByTask
{
    public class GetRemindersByTaskQuery : IRequest<IReadOnlyList<ReminderDto>>
    {
        public Guid TaskId { get; set; }
    }
}
