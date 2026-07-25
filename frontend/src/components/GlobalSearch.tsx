import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Search, X } from 'lucide-react';
import { getUserTasks } from '../api/tasks';
import { TaskItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const GlobalSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
    previouslyFocused.current?.focus();
  }, []);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserTasks();
      if (Array.isArray(data)) setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const openSearch = useCallback(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) {
          close();
        } else {
          openSearch();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, openSearch]);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => inputRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoped = tasks.filter((t) => t.userId === user?.userId);
    if (!q) return scoped.slice(0, 8);
    return scoped
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [tasks, query, user?.userId]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const selectTask = (task: TaskItem) => {
    close();
    navigate('/tasks');
    void task;
  };

  const onDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      selectTask(results[activeIndex]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-white md:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search tasks...</span>
        <kbd className="ml-2 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={openSearch}
        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
        aria-label="Search tasks"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search tasks"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onDialogKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
              <Search className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onDialogKeyDown}
                placeholder="Search tasks..."
                aria-autocomplete="list"
                aria-controls="global-search-results"
                className="h-12 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div id="global-search-results" className="max-h-80 overflow-y-auto p-2" role="listbox">
              {loading ? (
                <p className="px-3 py-6 text-center text-sm text-zinc-500">
                  Loading...
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-zinc-500">
                  No tasks found
                </p>
              ) : (
                <ul>
                  {results.map((task, index) => (
                    <li key={task.taskId} role="option" aria-selected={index === activeIndex}>
                      <button
                        type="button"
                        onClick={() => selectTask(task)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          index === activeIndex
                            ? 'bg-zinc-900 text-white'
                            : 'text-zinc-800 hover:bg-zinc-50'
                        }`}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2
                            className={`h-4 w-4 shrink-0 ${
                              index === activeIndex
                                ? 'text-emerald-300'
                                : 'text-emerald-600'
                            }`}
                          />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-zinc-400" />
                        )}
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {task.title}
                        </span>
                        <span
                          className={`shrink-0 text-xs ${
                            index === activeIndex
                              ? 'text-zinc-300'
                              : 'text-zinc-400'
                          }`}
                        >
                          {task.isCompleted ? 'Done' : 'Open'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400">
              ↑↓ navigate · Enter open · Esc close · Tab cycles
            </div>
          </div>
        </div>
      )}
    </>
  );
};
