using Microsoft.EntityFrameworkCore;
using NebulaCore.Domain.Data;
using NebulaCore.Domain.IRepository;
using NebulaCore.Infrastruktur.Persistence;

namespace NebulaCore.Infrastruktur.Repository
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();
        }

        public async Task<Category?> GetByIdAsync(Guid id)
        {
            return await _context.Categories
                .Include(c => c.User)
                .Include(c => c.Tasks)
                .FirstOrDefaultAsync(c => c.CategoryId == id);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                .Include(c => c.User)
                .Include(c => c.Tasks)
                .ToListAsync();
        }

        public async Task UpdateAsync(Category category)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<IEnumerable<Category>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Categories
                .Where(c => c.UserId == userId)
                .Include(c => c.User)
                .Include(c => c.Tasks)
                .ToListAsync();
        }
    }
}