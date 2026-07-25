import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { TaskItem } from '../../types';
import {
  formatDueLabel,
  priorityBadgeClass,
  priorityLabels,
} from '../../utils/taskQueries';

interface UpcomingDeadlinesProps {
  tasks: TaskItem[];
}

export const UpcomingDeadlines = ({ tasks }: UpcomingDeadlinesProps) => {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Upcoming Deadlines</h3>
        <Link
          to="/tasks"
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
        >
          View all
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <CalendarClock className="mb-3 h-10 w-10 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-800">No upcoming deadlines</p>
          <p className="mt-1 text-xs text-zinc-500">
            Tasks with due dates will show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {tasks.map((task) => (
            <li
              key={task.taskId}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {task.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {task.dueDate ? formatDueLabel(task.dueDate) : '—'}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                  priorityBadgeClass[task.priority]
                }`}
              >
                {priorityLabels[task.priority]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
