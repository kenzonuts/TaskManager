using FluentValidation;

namespace TaskManager.Application.Project.Command.Create
{
    public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand>
    {
        public CreateProjectCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Project name is required.")
                .MaximumLength(100).WithMessage("Project name max 100 characters.");
            RuleFor(x => x.Description)
                .MaximumLength(500).When(x => x.Description != null);
            RuleFor(x => x.Color)
                .MaximumLength(20).When(x => x.Color != null);
        }
    }
}
