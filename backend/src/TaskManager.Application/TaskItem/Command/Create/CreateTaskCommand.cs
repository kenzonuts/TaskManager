using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace TaskManager.Application.TaskItem.Command.Create
{
    public class CreateTaskCommand : IRequest<Guid>
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public int Priority { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? ProjectId { get; set; }
        public int? EstimatedMinutes { get; set; }
        public int? ScheduleStartMinutes { get; set; }
        public int? ScheduleEndMinutes { get; set; }
    }
}