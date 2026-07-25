using FluentValidation;

namespace TaskManager.Application.TaskItem.Command.Create
{
    public class CreateTaskCommandValidator : AbstractValidator<CreateTaskCommand>
    {
        public CreateTaskCommandValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Judul tugas wajib diisi.")
                .MaximumLength(200).WithMessage("Judul maksimal 200 karakter.");
            RuleFor(x => x.Priority)
                .InclusiveBetween(0, 3).WithMessage("Priority harus antara 0 dan 3.");
            RuleFor(x => x.Description)
                .MaximumLength(2000).When(x => x.Description != null);
        }
    }
}
