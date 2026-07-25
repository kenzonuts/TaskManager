using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace TaskManager.Application.TaskItem.Command.Update
{
    public class UpdateTaskCompletionCommand : IRequest
    {
        public Guid TaskId { get; set; }
        public bool IsCompleted { get; set; }
    }
}