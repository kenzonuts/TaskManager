using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Command.Tracking
{
    public class StartTrackingCommandHandler : IRequestHandler<StartTrackingCommand, Unit>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public StartTrackingCommandHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(StartTrackingCommand request, CancellationToken cancellationToken)
        {
            var userId = RequireUserId();
            var task = await LoadOwnedTask(request.TaskId, userId);

            if (task.TrackingStartedAt == null)
            {
                task.TrackingStartedAt = DateTime.UtcNow;
                task.UpdatedAt = DateTime.UtcNow;
                await _taskRepository.UpdateAsync(task);
            }

            return Unit.Value;
        }

        private string RequireUserId()
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");
            return userId;
        }

        private async Task<Domain.Data.TaskItem> LoadOwnedTask(Guid taskId, string userId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null)
                throw new KeyNotFoundException("Task not found");
            if (task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot update this task");
            return task;
        }
    }

    public class StopTrackingCommandHandler : IRequestHandler<StopTrackingCommand, Unit>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public StopTrackingCommandHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(StopTrackingCommand request, CancellationToken cancellationToken)
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

            if (task.TrackingStartedAt.HasValue)
            {
                var elapsed = (int)(DateTime.UtcNow - task.TrackingStartedAt.Value).TotalSeconds;
                task.TrackingElapsedSeconds += Math.Max(0, elapsed);
                task.TrackingStartedAt = null;
                task.UpdatedAt = DateTime.UtcNow;
                await _taskRepository.UpdateAsync(task);
            }

            return Unit.Value;
        }
    }
}
