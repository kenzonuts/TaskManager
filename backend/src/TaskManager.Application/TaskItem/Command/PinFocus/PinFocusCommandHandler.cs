using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Command.PinFocus
{
    public class PinFocusCommandHandler : IRequestHandler<PinFocusCommand, Unit>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public PinFocusCommandHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(PinFocusCommand request, CancellationToken cancellationToken)
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

            if (request.IsPinned)
            {
                var userTasks = await _taskRepository.GetAllByUserIdAsync(uid);
                foreach (var t in userTasks.Where(t => t.IsPinnedFocus && t.TaskId != task.TaskId))
                {
                    t.IsPinnedFocus = false;
                    t.UpdatedAt = DateTime.UtcNow;
                    await _taskRepository.UpdateAsync(t);
                }
            }

            task.IsPinnedFocus = request.IsPinned;
            task.UpdatedAt = DateTime.UtcNow;
            await _taskRepository.UpdateAsync(task);
            return Unit.Value;
        }
    }
}
