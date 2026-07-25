using MediatR;

namespace TaskManager.Application.Users.Command.Update
{
    public class UpdateSettingsCommand : IRequest<UpdateSettingsResult>
    {
        public string? Username { get; set; }
        public int? WeeklyGoal { get; set; }
    }

    public class UpdateSettingsResult
    {
        public Guid UserId { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int WeeklyGoal { get; set; }
    }
}
