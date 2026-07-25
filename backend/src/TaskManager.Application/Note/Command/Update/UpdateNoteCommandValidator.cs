using FluentValidation;

namespace TaskManager.Application.Note.Command.Update
{
    public class UpdateNoteCommandValidator : AbstractValidator<UpdateNoteCommand>
    {
        public UpdateNoteCommandValidator()
        {
            RuleFor(x => x.NoteId).NotEmpty();
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Isi catatan wajib diisi.")
                .MaximumLength(1000).WithMessage("Catatan maksimal 1000 karakter.");
        }
    }
}
