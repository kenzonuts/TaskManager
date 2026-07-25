using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Command.Update
{
public class UpdateTaskCompletionCommandHandler : IRequestHandler<UpdateTaskCompletionCommand>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateTaskCompletionCommandHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(UpdateTaskCompletionCommand request, CancellationToken cancellationToken)
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

            task.IsCompleted = request.IsCompleted;
            task.UpdatedAt = DateTime.UtcNow;
            task.CompletedAt = request.IsCompleted ? DateTime.UtcNow : null;

            await _taskRepository.UpdateAsync(task);
        }
    }
}