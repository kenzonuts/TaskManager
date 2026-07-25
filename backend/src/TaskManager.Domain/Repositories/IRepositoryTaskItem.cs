using TaskManager.Domain.Data;

namespace TaskManager.Domain.Repositories
{
    public interface IRepositoryTaskItem
    {
        Task AddAsync(TaskItem task);
        Task<TaskItem?> GetByIdAsync(Guid id);
        Task<IEnumerable<TaskItem>> GetByUserIdAsync(Guid userId);
        Task UpdateAsync(TaskItem task);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<TaskItem>> GetAllByUserIdAsync(Guid userId);
    }
}
