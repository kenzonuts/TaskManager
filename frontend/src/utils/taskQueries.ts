import { PriorityLevel, TaskItem } from '../types';

export function userTasks(tasks: TaskItem[], userId?: string) {
  if (!userId) return [];
  return tasks.filter((task) => task.userId === userId);
}

export function computeStats(tasks: TaskItem[]) {
  const completed = tasks.filter((t) => t.isCompleted).length;
  const pending = tasks.filter((t) => !t.isCompleted).length;
  const overdue = tasks.filter(
    (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  return { total: tasks.length, completed, pending, overdue };
}

export function getUpcomingDeadlines(tasks: TaskItem[], limit = 6) {
  return tasks
    .filter((t) => !t.isCompleted && t.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, limit);
}

export function getRecentTasks(tasks: TaskItem[], limit = 6) {
  return [...tasks]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

/** Local calendar date key YYYY-MM-DD */
export function toDateKey(date: Date | string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dueDateKeys(tasks: TaskItem[]) {
  const keys = new Set<string>();
  for (const task of tasks) {
    if (task.dueDate) {
      keys.add(toDateKey(task.dueDate));
    }
  }
  return keys;
}

export function formatDueLabel(date: Date | string) {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (toDateKey(d) === toDateKey(today)) return 'Today';
  if (toDateKey(d) === toDateKey(tomorrow)) return 'Tomorrow';

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string) {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const priorityLabels: Record<PriorityLevel, string> = {
  [PriorityLevel.Low]: 'Low',
  [PriorityLevel.Medium]: 'Medium',
  [PriorityLevel.High]: 'High',
  [PriorityLevel.Critical]: 'Critical',
};

export const priorityBadgeClass: Record<PriorityLevel, string> = {
  [PriorityLevel.Low]: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  [PriorityLevel.Medium]: 'bg-amber-50 text-amber-800 border-amber-200',
  [PriorityLevel.High]: 'bg-orange-50 text-orange-800 border-orange-200',
  [PriorityLevel.Critical]: 'bg-red-50 text-red-800 border-red-200',
};
