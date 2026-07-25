import { Plus, StickyNote } from 'lucide-react';

interface QuickActionsProps {
  onNewTask: () => void;
  onNewNote?: () => void;
}

export const QuickActions = ({ onNewTask, onNewNote }: QuickActionsProps) => {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-zinc-900">Quick Actions</span>
        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
        {onNewNote && (
          <button
            type="button"
            onClick={onNewNote}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            <StickyNote className="h-4 w-4" />
            New Note
          </button>
        )}
      </div>
    </div>
  );
};
