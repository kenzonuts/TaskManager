using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NebulaCore.Application.TaskItem.Command.Create;
using NebulaCore.Application.TaskItem.Command.Delete;
using NebulaCore.Application.TaskItem.Command.Update;
using NebulaCore.Application.TaskItem.Command.UpdateTitle;
using NebulaCore.Application.TaskItem.Queries.GetAll;
using NebulaCore.Application.TaskItem.Queries.GetById;

namespace NebulaCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TaskCategory : ControllerBase
    {
        private readonly IMediator _mediator;

        public TaskCategory(IMediator mediator)
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