using MediatR;
using Microsoft.Extensions.Configuration;
using TaskManager.Application.Users.Dtos;
using TaskManager.Domain.Repositories;

namespace TaskManager.Application.Users.Command.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResultDto>
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _config;

        public RegisterCommandHandler(IUserRepository userRepository, IConfiguration config)
        {
            _userRepository = userRepository;
            _config = config;
        }

        public async Task<AuthResultDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var existingUserByEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new EmailAlreadyExistsException("Email sudah terdaftar");
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new Domain.Data.User
            {
                UserId = Guid.NewGuid(),
                Username = request.Username,
                Email = request.Email,
                Password = hashedPassword,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);

            return JwtTokenGenerator.CreateAuthResult(user, _config);
        }
    }

    public class EmailAlreadyExistsException : Exception
    {
        public EmailAlreadyExistsException(string message) : base(message) { }
    }
}
