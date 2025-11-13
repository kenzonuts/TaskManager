using MediatR;
using NebulaCore.Domain.Repositories;
namespace NebulaCore.Application.Users.Command.Update
{
    public class UpdatePasswordCommandHandler : IRequestHandler<UpdatePasswordCommand, bool>
    {
        private readonly IUserRepository _userRepository;

        public UpdatePasswordCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<bool> Handle(UpdatePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);

            if (user == null)
                throw new Exception("User tidak ditemukan 🚫");

            user.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);

            await _userRepository.UpdateAsync(user);

            return true;
        }
    }
}
