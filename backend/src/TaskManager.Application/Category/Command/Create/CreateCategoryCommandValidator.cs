using FluentValidation;

namespace TaskManager.Application.Category.Command.Create
{
    public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
    {
        public CreateCategoryCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nama kategori wajib diisi.")
                .MaximumLength(100).WithMessage("Nama kategori maksimal 100 karakter.");
        }
    }
}
