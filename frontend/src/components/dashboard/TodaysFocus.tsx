import { Star } from 'lucide-react';
import { TaskItem } from '../../types';
import { priorityBadgeClass, priorityLabels } from '../../utils/taskQueries';

interface TodaysFocusProps {
  task: TaskItem | null;
  onComplete?: (taskId: string) => void;
}

export const TodaysFocus = ({ task, onComplete }: TodaysFocusProps) => {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-zinc-900" strokeWidth={2} />
        <h3 className="text-sm font-semibold text-zinc-900">Today&apos;s Focus</h3>
      </div>

      {!task ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-zinc-800">All clear</p>
          <p className="mt-1 text-xs text-zinc-500">
            No unfinished tasks to focus on right now.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-lg font-semibold tracking-tight text-zinc-900">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
              {task.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                priorityBadgeClass[task.priority]
              }`}
            >
              {priorityLabels[task.priority]} Priority
            </span>
            {onComplete && (
              <button
                type="button"
                onClick={() => onComplete(task.taskId)}
                className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Mark done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
