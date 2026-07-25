using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Data;
using TaskManager.Domain.Repositories;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Repository
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;

        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Project project)
        {
            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
        }

        public async Task<Project?> GetByIdAsync(Guid id)
        {
            return await _context.Projects
                .Include(p => p.User)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.ProjectId == id);
        }

        public async Task<IEnumerable<Project>> GetAllAsync()
        {
            return await _context.Projects
                .Include(p => p.User)
                .Include(p => p.Tasks)
                .ToListAsync();
        }

        public async Task UpdateAsync(Project project)
        {
            _context.Projects.Update(project);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project != null)
            {
                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Project>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.User)
                .Include(p => p.Tasks)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }
    }
}
