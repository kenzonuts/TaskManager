using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Enum;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Command.UpdateTitle
{
    public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateTaskCommandHandler(
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

        public async Task Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var uid = Guid.Parse(userId);
            var task = await _taskRepository.GetByIdAsync(request.TaskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            if (task.UserId != uid)
                throw new UnauthorizedAccessException("You cannot update this task");

            if (request.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(request.CategoryId.Value);
                if (category == null || category.UserId != uid)
                    throw new UnauthorizedAccessException("You cannot assign this category");
            }

            if (request.ProjectId.HasValue)
            {
                var project = await _projectRepository.GetByIdAsync(request.ProjectId.Value);
                if (project == null || project.UserId != uid)
                    throw new UnauthorizedAccessException("You cannot assign this project");
            }

            task.Title = request.Title;
            task.Description = request.Description;
            task.DueDate = request.DueDate;
            task.Priority = (PriorityLevel)request.Priority;
            task.CategoryId = request.CategoryId;
            task.ProjectId = request.ProjectId;
            task.EstimatedMinutes = request.EstimatedMinutes;
            task.ScheduleStartMinutes = request.ScheduleStartMinutes;
            task.ScheduleEndMinutes = request.ScheduleEndMinutes;
            if (request.IsPinnedFocus.HasValue)
            {
                if (request.IsPinnedFocus.Value)
                {
                    var userTasks = await _taskRepository.GetAllByUserIdAsync(uid);
                    foreach (var t in userTasks.Where(t => t.IsPinnedFocus && t.TaskId != task.TaskId))
                    {
                        t.IsPinnedFocus = false;
                        t.UpdatedAt = DateTime.UtcNow;
                        await _taskRepository.UpdateAsync(t);
                    }
                }

                task.IsPinnedFocus = request.IsPinnedFocus.Value;
            }
            task.UpdatedAt = DateTime.UtcNow;

            await _taskRepository.UpdateAsync(task);
        }
    }
}
