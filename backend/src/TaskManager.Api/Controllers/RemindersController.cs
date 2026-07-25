using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Reminder.Command.Create;
using TaskManager.Application.Reminder.Command.Delete;
using TaskManager.Application.Reminder.Command.Update;
using TaskManager.Application.Reminder.Queries.GetByTask;

namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RemindersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RemindersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReminderCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(new { Id = id, Message = "Reminder created successfully" });
        }

        [HttpGet("task/{taskId:guid}")]
        public async Task<IActionResult> GetByTask(Guid taskId)
        {
            var reminders = await _mediator.Send(new GetRemindersByTaskQuery { TaskId = taskId });
            return Ok(reminders);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateReminderCommand command)
        {
            if (id != command.ReminderId)
                return BadRequest(new { error = "ReminderId mismatch" });

            await _mediator.Send(command);
            return Ok(new { Message = "Reminder updated successfully" });
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteReminderCommand { ReminderId = id });
            return Ok(new { Message = "Reminder deleted successfully" });
        }
    }
}
