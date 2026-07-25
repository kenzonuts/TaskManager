using FluentValidation;
using TaskManager.Application.TaskItem.Command.Update;

namespace TaskManager.Application.TaskItem.Command.Update
{
    public class UpdateTaskCompletionCommandValidator : AbstractValidator<UpdateTaskCompletionCommand>
    {
        public UpdateTaskCompletionCommandValidator()
        {
            RuleFor(x => x.TaskId).NotEmpty();
        }
    }
}
