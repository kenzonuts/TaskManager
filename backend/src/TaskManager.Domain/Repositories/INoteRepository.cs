using TaskManager.Domain.Data;

namespace TaskManager.Domain.Repositories
{
    public interface INoteRepository
    {
        Task AddAsync(Note note);
        Task<Note?> GetByIdAsync(Guid id);
        Task UpdateAsync(Note note);
        Task DeleteAsync(Guid id);
        Task<IEnumerable<Note>> GetByUserIdAsync(Guid userId);
    }
}
