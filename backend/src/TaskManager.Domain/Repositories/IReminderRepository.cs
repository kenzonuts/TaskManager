using TaskManager.Domain.Data;

namespace TaskManager.Domain.Repositories
{
    public interface IReminderRepository
    {
        Task<IEnumerable<Reminder>> GetAllAsync();
        Task<Reminder?> GetByIdAsync(Guid reminderId);
        Task<IEnumerable<Reminder>> GetByTaskIdAsync(Guid taskId);
        Task AddAsync(Reminder reminder);
        Task UpdateAsync(Reminder reminder);
        Task DeleteAsync(Guid reminderId);
        Task SaveChangesAsync();
    }
}