using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using NebulaCore.Domain.Enum;
using NebulaCore.Domain.IRepository;

namespace NebulaCore.Application.TaskItem.Command.UpdateTitle
{
    public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateTaskCommandHandler(
            IRepositoryTaskItem taskRepository,
            ICategoryRepository categoryRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _categoryRepository = categoryRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var task = await _taskRepository.GetByIdAsync(request.TaskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            if (task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot update this task");

            // kalau ada CategoryId, cek kepemilikan
            if (request.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
                if (category == null || category.UserId != Guid.Parse(userId))
                    throw new UnauthorizedAccessException("You cannot assign this category");
            }

            task.Title = request.Title;
            task.Description = request.Description;
            task.DueDate = request.DueDate;
            task.Priority = (PriorityLevel)request.Priority;
            task.CategoryId = request.CategoryId;

            await _taskRepository.UpdateAsync(task);
        }
    }
}
