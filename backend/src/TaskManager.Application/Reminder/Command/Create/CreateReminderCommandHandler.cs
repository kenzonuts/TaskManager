using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManager.Domain.Repositories;
using TaskManager.Domain.Data;

namespace TaskManager.Application.Reminder.Command.Create
{
    public class CreateReminderCommandHandler
    {
        private readonly IReminderRepository _repo;
        private readonly IRepositoryTaskItem _taskRepo;

        public CreateReminderCommandHandler(IReminderRepository repo, IRepositoryTaskItem taskRepo)
        {
            _repo = repo;
            _taskRepo = taskRepo;
        }

        public async Task HandleAsync(CreateReminderCommand cmd)
        {
            var reminder = new TaskManager.Domain.Data.Reminder
            {
                ReminderId = Guid.NewGuid(),
                TaskId = cmd.TaskId,
                RemindAt = cmd.RemindAt,
                IsSent = false
            };

            await _repo.AddAsync(reminder);
            await _repo.SaveChangesAsync();
        }

        public async Task<bool> ValidateTaskOwnershipAsync(Guid taskId, Guid userId)
        {
            var task = await _taskRepo.GetByIdAsync(taskId);
            return task != null && task.UserId == userId;
        }
    }
}
