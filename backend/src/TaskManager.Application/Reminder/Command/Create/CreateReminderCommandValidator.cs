using FluentValidation;

namespace TaskManager.Application.Reminder.Command.Create
{
    public class CreateReminderCommandValidator : AbstractValidator<CreateReminderCommand>
    {
        public CreateReminderCommandValidator()
        {
            RuleFor(x => x.TaskId).NotEmpty();
            RuleFor(x => x.RemindAt)
                .Must(dt => dt > DateTime.UtcNow)
                .WithMessage("Waktu reminder harus di masa depan.");
        }
    }
}
