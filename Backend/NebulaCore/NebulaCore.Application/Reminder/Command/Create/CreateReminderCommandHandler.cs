using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NebulaCore.Domain.IRepository;
using NebulaCore.Domain.Data;

namespace NebulaCore.Application.Reminder.Command.Create
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
            var reminder = new NebulaCore.Domain.Data.Reminder
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
