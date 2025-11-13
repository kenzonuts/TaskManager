using MediatR;
using NebulaCore.Domain.Repositories;
using System;

namespace NebulaCore.Application.Users.Command.Register
{
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Guid>
    {
        private readonly IUserRepository _userRepository;

        public RegisterCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<Guid> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var existingUserByEmail = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new EmailAlreadyExistsException("Email sudah terdaftar 🚫");
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

            return user.UserId;
        }
    }

    public class EmailAlreadyExistsException : Exception
    {
        public EmailAlreadyExistsException(string message) : base(message) { }
    }
}
