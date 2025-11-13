using MediatR;
using Microsoft.AspNetCore.Http;
using NebulaCore.Domain.IRepository;
using System.Security.Claims;

namespace NebulaCore.Application.Category.Command.Create
{
    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Guid>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateCategoryCommandHandler(
            ICategoryRepository categoryRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _categoryRepository = categoryRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var category = new Domain.Data.Category
            {
                CategoryId = Guid.NewGuid(),
                Name = request.Name,
                UserId = Guid.Parse(userId)
            };

            await _categoryRepository.AddAsync(category);

            return category.CategoryId;
        }
    }
}