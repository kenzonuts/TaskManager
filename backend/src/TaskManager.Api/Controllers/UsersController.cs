using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Users.Command.Delete;
using TaskManager.Application.Users.Command.Login;
using TaskManager.Application.Users.Command.Register;
using TaskManager.Application.Users.Command.Update;
using TaskManager.Application.Users.Dtos;

namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut("me/password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User tidak terautentikasi");

            var result = await _mediator.Send(new UpdatePasswordCommand
            {
                UserId = Guid.Parse(userIdClaim),
                Password = dto.Password
            });

            if (!result)
                throw new InvalidOperationException("Gagal update password");

            return Ok(new { Message = "Password berhasil diperbarui" });
        }

        [HttpPut("me/settings")]
        [Authorize]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _mediator.Send(new DeleteUserCommand { UserId = id });
            if (!result)
                throw new KeyNotFoundException("User tidak ditemukan");

            return Ok(new { Message = "User berhasil dihapus" });
        }
    }
}
