using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Project.Command.Delete
{
    public class DeleteProjectCommandHandler : IRequestHandler<DeleteProjectCommand, Unit>
    {
        private readonly IProjectRepository _projectRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteProjectCommandHandler(
            IProjectRepository projectRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _projectRepository = projectRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
        {
            var userId = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("User not logged in");

            var project = await _projectRepository.GetByIdAsync(request.ProjectId);
            if (project == null)
                throw new KeyNotFoundException("Project not found");

            if (project.UserId != Guid.Parse(userId))
                throw new UnauthorizedAccessException("You cannot delete this project");

            if (project.Tasks.Any(t => !t.IsCompleted))
                throw new InvalidOperationException(
                    "Cannot delete project while unfinished tasks remain. Complete or reassign them first.");

            await _projectRepository.DeleteAsync(request.ProjectId);
            return Unit.Value;
        }
    }
}
