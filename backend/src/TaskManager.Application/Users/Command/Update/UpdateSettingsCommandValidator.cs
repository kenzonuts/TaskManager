using FluentValidation;

namespace TaskManager.Application.Users.Command.Update
{
    public class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
    {
        public UpdateSettingsCommandValidator()
        {
            RuleFor(x => x.Username)
                .MinimumLength(2).When(x => !string.IsNullOrWhiteSpace(x.Username))
                .MaximumLength(50).When(x => !string.IsNullOrWhiteSpace(x.Username));

            RuleFor(x => x.WeeklyGoal)
                .InclusiveBetween(1, 500).When(x => x.WeeklyGoal.HasValue);
        }
    }
}
