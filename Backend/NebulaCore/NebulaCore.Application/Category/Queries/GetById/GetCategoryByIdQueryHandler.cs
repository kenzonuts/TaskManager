using System;
using MediatR;
using Microsoft.AspNetCore.Http;
using NebulaCore.Domain.IRepository;
using System.Security.Claims;

namespace NebulaCore.Application.Category.Queries.GetById
{
    public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, Domain.Data.Category>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetCategoryByIdQueryHandler(
            ICategoryRepository categoryRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _categoryRepository = categoryRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Domain.Data.Category> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var category = await _categoryRepository.GetByIdAsync(request.CategoryId);

            if (category == null)
                throw new KeyNotFoundException("Category not found");

            if (category.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot access this category");

            return category;
        }
    }
}