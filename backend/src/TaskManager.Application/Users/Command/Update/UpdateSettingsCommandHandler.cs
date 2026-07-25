using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Http;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Users.Command.Update
{
    public class UpdateSettingsCommandHandler : IRequestHandler<UpdateSettingsCommand, UpdateSettingsResult>
    {
        private readonly IUserRepository _userRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateSettingsCommandHandler(
            IUserRepository userRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<UpdateSettingsResult> Handle(
            UpdateSettingsCommand request,
            CancellationToken cancellationToken)
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not logged in");

            var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdClaim));
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (!string.IsNullOrWhiteSpace(request.Username))
                user.Username = request.Username.Trim();

            if (request.WeeklyGoal.HasValue)
                user.WeeklyGoal = request.WeeklyGoal.Value;

            await _userRepository.UpdateAsync(user);

            return new UpdateSettingsResult
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                WeeklyGoal = user.WeeklyGoal
            };
        }
    }
}
