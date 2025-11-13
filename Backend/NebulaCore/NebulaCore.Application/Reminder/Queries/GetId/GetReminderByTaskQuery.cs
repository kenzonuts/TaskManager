using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NebulaCore.Application.Reminder.Queries.GetId
{
    public class GetRemindersByTaskQuery
    {
        public Guid TaskId { get; }
        public Guid UserId { get; }

        public GetRemindersByTaskQuery(Guid taskId, Guid userId)
        {
            TaskId = taskId;
            UserId = userId;
        }
    }
}