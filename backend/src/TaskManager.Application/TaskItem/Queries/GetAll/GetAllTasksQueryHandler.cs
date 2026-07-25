using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Application.TaskItem.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.TaskItem.Queries.GetAll
{
    public class GetAllTasksQueryHandler : IRequestHandler<GetAllTasksQuery, IEnumerable<GetByUserDto>>
    {
        private readonly IRepositoryTaskItem _taskRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetAllTasksQueryHandler(
            IRepositoryTaskItem taskRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _taskRepository = taskRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<GetByUserDto>> Handle(GetAllTasksQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var tasks = await _taskRepository.GetAllByUserIdAsync(Guid.Parse(userId));

            return tasks.Select(task => new GetByUserDto
            {
                TaskId = task.TaskId,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Priority = task.Priority,
                IsCompleted = task.IsCompleted,
                UserId = task.UserId,
                CategoryId = task.CategoryId
            });
        }
    }
}
