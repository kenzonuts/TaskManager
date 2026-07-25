using FluentValidation;

namespace TaskManager.Application.Reminder.Command.Update
{
    public class UpdateReminderCommandValidator : AbstractValidator<UpdateReminderCommand>
    {
        public UpdateReminderCommandValidator()
        {
            RuleFor(x => x.ReminderId).NotEmpty();
            RuleFor(x => x.RemindAt)
                .Must(dt => dt > DateTime.UtcNow)
                .WithMessage("Waktu reminder harus di masa depan.");
        }
    }
}
