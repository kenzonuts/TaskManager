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
            try
            {
                var userId = await _mediator.Send(command);
                return Ok(new { UserId = userId, Message = "Registrasi berhasil 🚀" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            try
            {
                var token = await _mediator.Send(command);
                return Ok(new { Token = token, Message = "Login berhasil " });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { Error = ex.Message });
            }
        }

        [HttpPut("me/password")]
        [Authorize]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User tidak terautentikasi");

            var command = new UpdatePasswordCommand
            {
                UserId = Guid.Parse(userIdClaim),
                Password = dto.Password
            };

            var result = await _mediator.Send(command);

            if (!(bool)result)
                return BadRequest("Gagal update password");

            return Ok("Password berhasil diperbarui ");
        }
        
        [HttpDelete("{id}")]
        [Authorize]

        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var result = await _mediator.Send(new DeleteUserCommand { UserId = id });

            if (!result)
                return NotFound("User tidak ditemukan");

            return Ok("User berhasil dihapus");
        }
    }
}
