using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Project.Command.Update
{
    public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, Unit>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateProjectCommandHandler(
            IProjectRepository projectRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _projectRepository = projectRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var project = await _projectRepository.GetByIdAsync(request.ProjectId);
            if (project == null)
                throw new KeyNotFoundException("Project not found");

            if (project.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot edit this project");

            project.Name = request.Name.Trim();
            project.Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();
            project.Color = string.IsNullOrWhiteSpace(request.Color) ? null : request.Color.Trim();

            await _projectRepository.UpdateAsync(project);
            return Unit.Value;
        }
    }
}
