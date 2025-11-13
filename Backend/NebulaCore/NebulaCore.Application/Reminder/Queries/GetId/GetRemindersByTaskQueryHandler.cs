using NebulaCore.Domain.IRepository;
using NebulaCore.Domain.Data;

namespace NebulaCore.Application.Reminder.Queries.GetId
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

        public async Task<IEnumerable<NebulaCore.Domain.Data.Reminder>> HandleAsync(GetRemindersByTaskQuery query)
        {
            var task = await _taskRepo.GetByIdAsync(query.TaskId);
            if (task == null || task.UserId != query.UserId)
                return Enumerable.Empty<NebulaCore.Domain.Data.Reminder>();

            return await _reminderRepo.GetByTaskIdAsync(query.TaskId);
        }
    }
}
