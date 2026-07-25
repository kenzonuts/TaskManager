using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Project.Command.Create
{
    public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateProjectCommandHandler(
            IProjectRepository projectRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _projectRepository = projectRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var project = new Domain.Data.Project
            {
                ProjectId = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
                Color = string.IsNullOrWhiteSpace(request.Color) ? null : request.Color.Trim(),
                UserId = Guid.Parse(userId),
                CreatedAt = DateTime.UtcNow
            };

            await _projectRepository.AddAsync(project);
            return project.ProjectId;
        }
    }
}
