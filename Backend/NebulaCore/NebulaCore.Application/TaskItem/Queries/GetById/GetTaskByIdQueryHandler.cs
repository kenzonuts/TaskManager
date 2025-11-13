using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using NebulaCore.Domain.IRepository;

namespace NebulaCore.Application.TaskItem.Queries.GetById
{
    public class GetTaskByIdQueryHandler : IRequestHandler<GetTaskByIdQuery, Domain.Data.TaskItem?>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetTaskByIdQueryHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Domain.Data.TaskItem?> Handle(GetTaskByIdQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var task = await _taskRepository.GetByIdAsync(request.TaskId);

            if (task == null)
                return null;

            if (task.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot access this task");

            return task;
        }
    }
}