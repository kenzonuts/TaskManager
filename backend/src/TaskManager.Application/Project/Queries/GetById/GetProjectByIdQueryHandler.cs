using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Application.Project.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Project.Queries.GetById
{
    public class GetProjectByIdQueryHandler : IRequestHandler<GetProjectByIdQuery, ProjectDto>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetProjectByIdQueryHandler(
            IProjectRepository projectRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _projectRepository = projectRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ProjectDto> Handle(GetProjectByIdQuery request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var project = await _projectRepository.GetByIdAsync(request.ProjectId);
            if (project == null)
                throw new KeyNotFoundException("Project not found");

            if (project.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot view this project");

            return new ProjectDto
            {
                ProjectId = project.ProjectId,
                Name = project.Name,
                Description = project.Description,
                Color = project.Color,
                UserId = project.UserId,
                CreatedAt = project.CreatedAt,
                TaskCount = project.Tasks.Count,
                CompletedTaskCount = project.Tasks.Count(t => t.IsCompleted)
            };
        }
    }
}
