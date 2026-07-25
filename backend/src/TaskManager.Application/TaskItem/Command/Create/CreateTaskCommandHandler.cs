using System.Security.Claims;
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
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateTaskCommandHandler(
            IRepositoryTaskItem taskRepository,
            ICategoryRepository categoryRepository,
            IProjectRepository projectRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _categoryRepository = categoryRepository;
            _projectRepository = projectRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var uid = Guid.Parse(userId);

            if (request.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
                if (category == null || category.UserId != uid)
                    throw new UnauthorizedAccessException("You cannot add task to this category");
            }

            if (request.ProjectId.HasValue)
            {
                var project = await _projectRepository.GetByIdAsync(request.ProjectId.Value);
                if (project == null || project.UserId != uid)
                    throw new UnauthorizedAccessException("You cannot add task to this project");
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
                UserId = uid,
                CategoryId = request.CategoryId,
                ProjectId = request.ProjectId,
                IsCompleted = false,
                EstimatedMinutes = request.EstimatedMinutes,
                ScheduleStartMinutes = request.ScheduleStartMinutes,
                ScheduleEndMinutes = request.ScheduleEndMinutes,
                IsPinnedFocus = false,
                TrackingElapsedSeconds = 0
            };

            await _taskRepository.AddAsync(task);

            return task.TaskId;
        }
    }
}
