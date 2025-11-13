using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using NebulaCore.Domain.IRepository;

namespace NebulaCore.Application.Category.Command.Update
{
    public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Unit>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateCategoryCommandHandler(
            ICategoryRepository categoryRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _categoryRepository = categoryRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);

            if (category == null)
                throw new KeyNotFoundException("Category not found");

            if (category.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot edit this category");

            category.Name = request.Name;

            await _categoryRepository.UpdateAsync(category);

            return Unit.Value;
        }
    }
}