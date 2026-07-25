using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Project.Command.Create;
using TaskManager.Application.Project.Command.Delete;
using TaskManager.Application.Project.Command.Update;
using TaskManager.Application.Project.Queries.GetAll;
using TaskManager.Application.Project.Queries.GetById;

namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProjectsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllProjectsQuery());
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetProjectByIdQuery { ProjectId = id });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectCommand command)
        {
            var projectId = await _mediator.Send(command);
            return Ok(new { Id = projectId, Message = "Project created successfully" });
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectCommand command)
        {
            if (id != command.ProjectId)
                return BadRequest("ProjectId mismatch");

            await _mediator.Send(command);
            return Ok(new { Message = "Project updated successfully" });
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteProjectCommand { ProjectId = id });
            return Ok(new { Message = "Project deleted successfully" });
        }
    }
}
