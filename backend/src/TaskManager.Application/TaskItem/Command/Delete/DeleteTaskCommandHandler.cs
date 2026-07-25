using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Command.Delete
{
    public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteTaskCommandHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var task = await _taskRepository.GetByIdAsync(request.TaskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            if (task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot delete this task");

            await _taskRepository.DeleteAsync(request.TaskId);
        }
    }
}
