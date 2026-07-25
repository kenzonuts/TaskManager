import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TaskItem } from '../types';
import { getUserTasks } from '../api/tasks';
import {
  formatDueLabel,
  priorityLabels,
  toDateKey,
  userTasks,
} from '../utils/taskQueries';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await getUserTasks();
        if (Array.isArray(data)) setTasks(data);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user]);

  const scoped = useMemo(() => userTasks(tasks, user?.userId), [tasks, user?.userId]);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const todayKey = toDateKey(new Date());

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    for (const t of scoped) {
      if (!t.dueDate) continue;
      const key = toDateKey(t.dueDate);
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [scoped]);

  const selectedTasks = tasksByDay.get(selectedKey) ?? [];
  const monthLabel = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-zinc-500">Loading calendar...</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Calendar
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Deadlines across the month.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {monthLabel}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-zinc-400">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`e-${index}`} className="aspect-square" />;
              }
              const key = toDateKey(new Date(year, month, day));
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;
              const count = tasksByDay.get(key)?.length ?? 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : isToday
                        ? 'bg-zinc-100 font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                        : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {day}
                  {count > 0 && (
                    <span
                      className={`mt-0.5 h-1 w-1 rounded-full ${
                        isSelected ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-900 dark:bg-zinc-100'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900 lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Tasks on day
          </h3>
          <p className="mb-4 text-xs text-zinc-500">
            {new Date(selectedKey + 'T12:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-zinc-500">No tasks due this day.</p>
          ) : (
            <ul className="space-y-3">
              {selectedTasks.map((t) => (
                <li
                  key={t.taskId}
                  className="rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
                >
                  <p
                    className={`text-sm font-medium ${
                      t.isCompleted
                        ? 'text-zinc-400 line-through'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {priorityLabels[t.priority]} · {formatDueLabel(t.dueDate!)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
