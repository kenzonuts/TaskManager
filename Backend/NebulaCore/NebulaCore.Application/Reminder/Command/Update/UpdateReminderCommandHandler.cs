using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NebulaCore.Domain.IRepository;

namespace NebulaCore.Application.Reminder.Command.Update
{
 public class UpdateReminderCommandHandler
    {
        private readonly IReminderRepository _reminderRepo;
        private readonly IRepositoryTaskItem _taskRepo;

        public UpdateReminderCommandHandler(IReminderRepository reminderRepo, IRepositoryTaskItem taskRepo)
        {
            _reminderRepo = reminderRepo;
            _taskRepo = taskRepo;
        }

        public async Task<(bool success, string message)> HandleAsync(Guid userId, Guid reminderId, DateTime newRemindAt)
        {
            var reminder = await _reminderRepo.GetByIdAsync(reminderId);
            if (reminder == null)
                return (false, "Reminder tidak ditemukan.");

            var task = await _taskRepo.GetByIdAsync(reminder.TaskId);
            if (task == null || task.UserId != userId)
                return (false, "Reminder ini bukan milik kamu.");

            if (newRemindAt <= DateTime.UtcNow)
                return (false, "Waktu reminder tidak boleh di masa lalu.");

            reminder.RemindAt = newRemindAt;
            reminder.IsSent = false;

            await _reminderRepo.UpdateAsync(reminder);
            await _reminderRepo.SaveChangesAsync();

            return (true, "Reminder berhasil diupdate!");
        }
    }
}