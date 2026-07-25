using TaskManager.Domain.Repositories;
using TaskManager.Domain.Data;

namespace TaskManager.Application.Reminder.Queries.GetId
{
    public class GetRemindersByTaskQueryHandler
    {
        private readonly IReminderRepository _reminderRepo;
        private readonly IRepositoryTaskItem _taskRepo;

        public GetRemindersByTaskQueryHandler(IReminderRepository reminderRepo, IRepositoryTaskItem taskRepo)
        {
            _reminderRepo = reminderRepo;
            _taskRepo = taskRepo;
        }

        public async Task<IEnumerable<TaskManager.Domain.Data.Reminder>> HandleAsync(GetRemindersByTaskQuery query)
        {
            var task = await _taskRepo.GetByIdAsync(query.TaskId);
            if (task == null || task.UserId != query.UserId)
                return Enumerable.Empty<TaskManager.Domain.Data.Reminder>();

            return await _reminderRepo.GetByTaskIdAsync(query.TaskId);
        }
    }
}
