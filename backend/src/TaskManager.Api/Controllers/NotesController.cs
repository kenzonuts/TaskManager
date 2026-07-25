using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Note.Command.Create;
using TaskManager.Application.Note.Command.Delete;
using TaskManager.Application.Note.Command.Update;
using TaskManager.Application.Note.Queries.GetAll;

namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllNotesQuery());
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNoteCommand command)
        {
            var noteId = await _mediator.Send(command);
            return Ok(new { Id = noteId, Message = "Note created successfully" });
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNoteCommand command)
        {
            if (id != command.NoteId)
                return BadRequest("NoteId mismatch");

            await _mediator.Send(command);
            return Ok(new { Message = "Note updated successfully" });
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteNoteCommand { NoteId = id });
            return Ok(new { Message = "Note deleted successfully" });
        }
    }
}
