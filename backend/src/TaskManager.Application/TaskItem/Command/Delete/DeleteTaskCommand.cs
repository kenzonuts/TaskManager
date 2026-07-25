using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace TaskManager.Application.TaskItem.Command.Delete
{
    public class DeleteTaskCommand : IRequest
    {
        public Guid TaskId { get; set; }
    }
}