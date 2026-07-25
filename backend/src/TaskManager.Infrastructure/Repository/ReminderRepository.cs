
using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Data;
using TaskManager.Domain.Repositories;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Repository
{
    public class ReminderRepository : IReminderRepository
    {
        private readonly AppDbContext _context;

        public ReminderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reminder>> GetAllAsync()
        {
            return await _context.Reminders
                .Include(r => r.Task)
                .ToListAsync();
        }

        public async Task<Reminder?> GetByIdAsync(Guid reminderId)
        {
            return await _context.Reminders
                .Include(r => r.Task)
                .FirstOrDefaultAsync(r => r.ReminderId == reminderId);
        }

        public async Task<IEnumerable<Reminder>> GetByTaskIdAsync(Guid taskId)
        {
            return await _context.Reminders
                .Where(r => r.TaskId == taskId)
                .Include(r => r.Task)
                .ToListAsync();
        }

        public async Task<IEnumerable<Reminder>> GetUpcomingByUserIdAsync(Guid userId, DateTime fromUtc, DateTime toUtc)
        {
            return await _context.Reminders
                .Include(r => r.Task)
                .Where(r =>
                    r.Task.UserId == userId &&
                    !r.IsSent &&
                    r.RemindAt >= fromUtc &&
                    r.RemindAt <= toUtc)
                .OrderBy(r => r.RemindAt)
                .Take(20)
                .ToListAsync();
        }

        public async Task AddAsync(Reminder reminder)
        {
            await _context.Reminders.AddAsync(reminder);
        }

        public async Task UpdateAsync(Reminder reminder)
        {
            _context.Reminders.Update(reminder);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Guid reminderId)
        {
            var reminder = await _context.Reminders.FindAsync(reminderId);
            if (reminder != null)
                _context.Reminders.Remove(reminder);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}