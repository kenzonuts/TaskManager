using MediatR;
using Microsoft.Extensions.Configuration;
using TaskManager.Application.Users.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Users.Command.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _config;

        public LoginCommandHandler(IUserRepository userRepository, IConfiguration config)
        {
            _userRepository = userRepository;
            _config = config;
        }

        public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
                throw new UserNotFoundException("Email tidak ditemukan");

            bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);

            if (!passwordValid)
                throw new InvalidPasswordException("Password salah");

            return JwtTokenGenerator.CreateAuthResult(user, _config);
        }
    }

    public class UserNotFoundException : Exception
    {
        public UserNotFoundException(string message) : base(message) { }
    }

    public class InvalidPasswordException : Exception
    {
        public InvalidPasswordException(string message) : base(message) { }
    }
}
