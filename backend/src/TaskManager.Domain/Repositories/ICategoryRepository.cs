using TaskManager.Domain.Data;

namespace TaskManager.Domain.Repositories
{
    public interface ICategoryRepository
    {
        Task AddAsync(Category category);
        Task<Category?> GetByIdAsync(Guid id);
        Task<IEnumerable<Category>> GetAllAsync();
        Task UpdateAsync(Category category);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<Category>> GetByUserIdAsync(Guid userId);
    }
}
