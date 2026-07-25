using FluentValidation;
using TaskManager.Application.TaskItem.Command.UpdateTitle;

namespace TaskManager.Application.TaskItem.Command.UpdateTitle
{
    public class UpdateTaskCommandValidator : AbstractValidator<UpdateTaskCommand>
    {
        public UpdateTaskCommandValidator()
        {
            RuleFor(x => x.TaskId).NotEmpty();
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Judul tugas wajib diisi.")
                .MaximumLength(200);
            RuleFor(x => x.Priority).InclusiveBetween(0, 3);
        }
    }
}
