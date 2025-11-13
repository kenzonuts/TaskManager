using FluentValidation;

namespace NebulaCore.Application.Users.Command.Register
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username gak boleh kosong.")
                .MinimumLength(3).WithMessage("Username minimal 3 karakter.")
                .MaximumLength(20).WithMessage("Username maksimal 20 karakter.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email wajib diisi.")
                .EmailAddress().WithMessage("Format email salah.");

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
