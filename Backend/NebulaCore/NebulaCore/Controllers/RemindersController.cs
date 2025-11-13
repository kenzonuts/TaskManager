using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NebulaCore.Application.Reminder.Command.Create;
using NebulaCore.Application.Reminder.Command.Delete;
using NebulaCore.Application.Reminder.Command.Update;
using NebulaCore.Application.Reminder.Queries.GetId;
using NebulaCore.Domain.Data;


namespace NebulaCore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RemindersController : ControllerBase
    {
        private readonly CreateReminderCommandHandler _createHandler;
        private readonly GetRemindersByTaskQueryHandler _getHandler;
        private readonly DeleteReminderCommandHandler _deleteHandler;
        private readonly UpdateReminderCommandHandler _updateHandler;

        public RemindersController(
            CreateReminderCommandHandler createHandler,
            GetRemindersByTaskQueryHandler getHandler,
            DeleteReminderCommandHandler deleteHandler,
            UpdateReminderCommandHandler updateHandler)
        {
            _createHandler = createHandler;
            _getHandler = getHandler;
            _deleteHandler = deleteHandler;
            _updateHandler = updateHandler;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReminder([FromBody] CreateReminderCommand command)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token tidak valid, userId tidak ditemukan.");

            var userId = Guid.Parse(userIdClaim);

            if (command.RemindAt <= DateTime.UtcNow)
                return BadRequest("Waktu reminder gak boleh di masa lalu.");

            if (!await _createHandler.ValidateTaskOwnershipAsync(command.TaskId, userId))
                return Forbid("Task ini bukan milik kamu, bro.");

            await _createHandler.HandleAsync(command);
            return Ok("Reminder berhasil dibuat!");
        }

        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<IEnumerable<Reminder>>> GetRemindersByTask(Guid taskId)
        {
            // Ambil UserId dari JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token tidak valid, userId tidak ditemukan.");

            var userId = Guid.Parse(userIdClaim);

            var query = new GetRemindersByTaskQuery(taskId, userId);
            var reminders = await _getHandler.HandleAsync(query);

            if (reminders == null || !reminders.Any())
                return NotFound("Belum ada reminder untuk task ini.");

            return Ok(reminders);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReminder(Guid id)
        {
            // Ambil UserId dari JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token tidak valid, userId tidak ditemukan.");

            var userId = Guid.Parse(userIdClaim);

            var deleted = await _deleteHandler.HandleAsync(id, userId);

            if (!deleted)
                return Forbid("Gak bisa hapus reminder yang bukan milik kamu.");

            return Ok("Reminder berhasil dihapus.");
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReminder(Guid id, [FromBody] DateTime remindAt)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("Token tidak valid, userId tidak ditemukan.");

            var userId = Guid.Parse(userIdClaim);

            var (success, message) = await _updateHandler.HandleAsync(userId, id, remindAt);

            if (!success)
                return BadRequest(message);

            return Ok(message);
        }

    }
}
