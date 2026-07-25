using TaskManager.Domain.Data;

namespace TaskManager.Domain.Repositories
{
    public interface IProjectRepository
    {
        Task AddAsync(Project project);
        Task<Project?> GetByIdAsync(Guid id);
        Task<IEnumerable<Project>> GetAllAsync();
        Task UpdateAsync(Project project);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<Project>> GetByUserIdAsync(Guid userId);
    }
}
