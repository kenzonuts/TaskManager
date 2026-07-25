using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace TaskManager.Application.Category.Command.Update
{
    public class UpdateCategoryCommand : IRequest<Unit>
    {
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = null!;
    }
}