using FluentValidation;

namespace TaskManager.Application.Note.Command.Create
{
    public class CreateNoteCommandValidator : AbstractValidator<CreateNoteCommand>
    {
        public CreateNoteCommandValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Isi catatan wajib diisi.")
                .MaximumLength(1000).WithMessage("Catatan maksimal 1000 karakter.");
        }
    }
}
