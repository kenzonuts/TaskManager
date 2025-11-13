using FluentValidation;

namespace NebulaCore.Application.Users.Command.Login
{
    public class LoginCommandValidator : AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email gak boleh kosong.")
                .EmailAddress().WithMessage("Format email salah, bro.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password wajib diisi.")
                .MinimumLength(6).WithMessage("Password minimal 6 karakter.");
        }
    }
}