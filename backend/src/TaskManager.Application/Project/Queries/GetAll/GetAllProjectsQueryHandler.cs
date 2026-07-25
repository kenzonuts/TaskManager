using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Application.Project.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Project.Queries.GetAll
{
    public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, IEnumerable<ProjectDto>>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetAllProjectsQueryHandler(
            IProjectRepository projectRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _projectRepository = projectRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<ProjectDto>> Handle(
            GetAllProjectsQuery request,
            CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var projects = await _projectRepository.GetByUserIdAsync(Guid.Parse(userId));

            return projects.Select(p => new ProjectDto
            {
                ProjectId = p.ProjectId,
                Name = p.Name,
                Description = p.Description,
                Color = p.Color,
                UserId = p.UserId,
                CreatedAt = p.CreatedAt,
                TaskCount = p.Tasks.Count,
                CompletedTaskCount = p.Tasks.Count(t => t.IsCompleted)
            });
        }
    }
}
