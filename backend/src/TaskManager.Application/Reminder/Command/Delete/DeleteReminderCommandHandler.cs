using TaskManager.Domain.Repositories;
using TaskManager.Domain.Data;

namespace TaskManager.Application.Reminder.Command.Delete
{
    public class DeleteReminderCommandHandler
    {
        private readonly IReminderRepository _repo;
        private readonly IRepositoryTaskItem _taskRepo;

        public DeleteReminderCommandHandler(IReminderRepository repo, IRepositoryTaskItem taskRepo)
        {
            _repo = repo;
            _taskRepo = taskRepo;
        }

        public async Task<bool> HandleAsync(Guid reminderId, Guid userId)
        {
            var reminder = await _repo.GetByIdAsync(reminderId);
            if (reminder == null)
                return false;

            var task = await _taskRepo.GetByIdAsync(reminder.TaskId);
            if (task == null || task.UserId != userId)
                return false;

            await _repo.DeleteAsync(reminderId);
            await _repo.SaveChangesAsync();
            return true;
        }
    }
}
