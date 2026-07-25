import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getUpcomingReminders } from '../api/reminders';

type Upcoming = {
  reminderId: string;
  taskId: string;
  taskTitle: string;
  remindAt: string;
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Upcoming[]>([]);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getUpcomingReminders();
      setItems(Array.isArray(data) ? data : []);
      setError(false);
    } catch {
      setError(true);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const dueSoon = items.filter(
    (r) => new Date(r.remindAt).getTime() <= Date.now() + 24 * 60 * 60 * 1000
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        aria-label="Reminders"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {dueSoon.length > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Upcoming reminders
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {error ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">
                  Could not load reminders.
                </p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">
                  No upcoming reminders.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {items.map((r) => (
                    <li key={r.reminderId} className="px-4 py-3">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {r.taskTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatWhen(r.remindAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
