using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NebulaCore.Application.Category.Command.Create;
using NebulaCore.Application.Category.Command.Delete;
using NebulaCore.Application.Category.Command.Update;
using NebulaCore.Application.Category.Queries.GetAll;
using NebulaCore.Application.Category.Queries.GetById;

namespace NebulaCore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllCategoriesQuery());
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _mediator.Send(new GetCategoryByIdQuery { CategoryId = id });
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
        {
            var categoryId = await _mediator.Send(command);
            return Ok(new { Id = categoryId, Message = "Category created successfully" });
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryCommand command)
        {
            if (id != command.CategoryId)
                return BadRequest("CategoryId mismatch");

            await _mediator.Send(command);
            return Ok(new { Message = "Category updated successfully" });
        }
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _mediator.Send(new DeleteCategoryCommand { CategoryId = id });
            return Ok(new { Message = "Category deleted successfully" });
        }

    }
}