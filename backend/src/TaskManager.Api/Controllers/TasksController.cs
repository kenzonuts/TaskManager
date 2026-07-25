using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.TaskItem.Command.Create;
using TaskManager.Application.TaskItem.Command.Delete;
using TaskManager.Application.TaskItem.Command.PinFocus;
using TaskManager.Application.TaskItem.Command.Tracking;
using TaskManager.Application.TaskItem.Command.Update;
using TaskManager.Application.TaskItem.Command.UpdateTitle;
using TaskManager.Application.TaskItem.Queries.GetAll;
using TaskManager.Application.TaskItem.Queries.GetById;

namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TasksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTaskCommand command)
        {
            var taskId = await _mediator.Send(command);
            return Ok(new { Id = taskId, Message = "Task created successfully" });
        }

        [HttpPut("{id:guid}/complete")]
        public async Task<IActionResult> UpdateCompletion(Guid id, [FromBody] UpdateTaskCompletionCommand command)
        {
            if (id != command.TaskId)
                return BadRequest("TaskId mismatch");

            await _mediator.Send(command);
            return Ok(new { Message = "Task completion status updated successfully" });
        }

        [HttpPut("{id:guid}/pin-focus")]
        public async Task<IActionResult> PinFocus(Guid id, [FromBody] PinFocusCommand command)
        {
            if (id != command.TaskId)
                return BadRequest("TaskId mismatch");

            await _mediator.Send(command);
            return Ok(new { Message = "Focus pin updated" });
        }

        [HttpPost("{id:guid}/tracking/start")]
        public async Task<IActionResult> StartTracking(Guid id)
        {
            await _mediator.Send(new StartTrackingCommand { TaskId = id });
            return Ok(new { Message = "Tracking started" });
        }

        [HttpPost("{id:guid}/tracking/stop")]
        public async Task<IActionResult> StopTracking(Guid id)
        {
            await _mediator.Send(new StopTrackingCommand { TaskId = id });
            return Ok(new { Message = "Tracking stopped" });
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskCommand command)
        {
            if (id != command.TaskId)
                return BadRequest("TaskId mismatch");

            await _mediator.Send(command);
            return Ok(new { Id = id, Message = "Task updated successfully" });
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteTaskCommand { TaskId = id });
            return Ok(new { Id = id, Message = "Task deleted successfully" });
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _mediator.Send(new GetTaskByIdQuery { TaskId = id });

            if (task == null)
                return NotFound(new { Message = "Task not found" });

            return Ok(task);
        }

        [HttpGet("GetUserTasks")]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _mediator.Send(new GetAllTasksQuery());
            return Ok(tasks);
        }
    }
}
