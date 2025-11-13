using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace NebulaCore.Application.TaskItem.Queries.GetById
{
    public class GetTaskByIdQuery : IRequest<Domain.Data.TaskItem>
    {
        public Guid TaskId { get; set; }
    }
}