using FluentValidation;

namespace TaskManager.Application.Category.Command.Update
{
    public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
    {
        public UpdateCategoryCommandValidator()
        {
            RuleFor(x => x.CategoryId).NotEmpty();
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nama kategori wajib diisi.")
                .MaximumLength(100).WithMessage("Nama kategori maksimal 100 karakter.");
        }
    }
}
