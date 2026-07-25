
using FluentValidation;

namespace TaskManager.Application.Users.Command.Update
{
    public class UpdatePasswordCommandValidator : AbstractValidator<UpdatePasswordCommand>
    {
        public UpdatePasswordCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId gak boleh kosong.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password wajib diisi.")
                .MinimumLength(6).WithMessage("Password minimal 6 karakter.")
                .Matches("[A-Z]").WithMessage("Password harus ada huruf besar.")
                .Matches("[a-z]").WithMessage("Password harus ada huruf kecil.")
                .Matches("[0-9]").WithMessage("Password harus ada angka.")
                .Matches("[^a-zA-Z0-9]").WithMessage("Password harus ada simbol.");
        }
    }
}
