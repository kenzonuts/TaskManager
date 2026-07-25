using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Category.Command.Delete
{
    public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Unit>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteCategoryCommandHandler(
            ICategoryRepository categoryRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _categoryRepository = categoryRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);

            if (category == null)
                throw new KeyNotFoundException("Category not found");

            if (category.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot delete this category");

            // Periksa apakah kategori masih memiliki tugas yang belum selesai
            if (category.Tasks.Any(t => !t.IsCompleted))
                throw new InvalidOperationException("Tidak dapat menghapus kategori karena masih ada tugas yang belum selesai. Selesaikan semua tugas terlebih dahulu sebelum menghapus kategori.");

            await _categoryRepository.DeleteAsync(request.CategoryId);

            return Unit.Value;
        }
    }
}