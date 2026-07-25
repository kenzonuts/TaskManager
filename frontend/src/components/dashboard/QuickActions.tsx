import { Plus, StickyNote, FolderKanban, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onNewTask: () => void;
  onNewNote?: () => void;
  onNewProject?: () => void;
}

export const QuickActions = ({
  onNewTask,
  onNewNote,
  onNewProject,
}: QuickActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Quick Actions
        </span>
        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
        {onNewNote && (
          <button
            type="button"
            onClick={onNewNote}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <StickyNote className="h-4 w-4" />
            New Note
          </button>
        )}
        {onNewProject && (
          <button
            type="button"
            onClick={onNewProject}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <FolderKanban className="h-4 w-4" />
            New Project
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          <CalendarDays className="h-4 w-4" />
          Schedule
        </button>
      </div>
    </div>
  );
};
