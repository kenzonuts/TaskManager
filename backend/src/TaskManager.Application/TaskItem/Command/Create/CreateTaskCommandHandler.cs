using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Enum;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Command.Create
{
    public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateTaskCommandHandler(
            IRepositoryTaskItem taskRepository,
            ICategoryRepository categoryRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _categoryRepository = categoryRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            if (request.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
                if (category == null || category.UserId != Guid.Parse(userId))
                    throw new UnauthorizedAccessException("You cannot add task to this category");
            }

            var task = new Domain.Data.TaskItem
            {
                TaskId = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CompletedAt = null,
                DueDate = request.DueDate,
                Priority = (PriorityLevel)request.Priority,
                UserId = Guid.Parse(userId),
                CategoryId = request.CategoryId,
                IsCompleted = false
            };

            await _taskRepository.AddAsync(task);

            return task.TaskId;
        }
    }    
}