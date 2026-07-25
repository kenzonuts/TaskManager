using FluentValidation;

namespace TaskManager.Application.Project.Command.Update
{
    public class UpdateProjectCommandValidator : AbstractValidator<UpdateProjectCommand>
    {
        public UpdateProjectCommandValidator()
        {
            RuleFor(x => x.ProjectId).NotEmpty();
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Project name is required.")
                .MaximumLength(100);
            RuleFor(x => x.Description)
                .MaximumLength(500).When(x => x.Description != null);
            RuleFor(x => x.Color)
                .MaximumLength(20).When(x => x.Color != null);
        }
    }
}
