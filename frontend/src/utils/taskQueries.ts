import { PriorityLevel, TaskItem } from '../types';

export const DEFAULT_WEEKLY_GOAL = 20;

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
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime;
    })
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
  [PriorityLevel.Critical]: 'Urgent',
};

export const priorityBadgeClass: Record<PriorityLevel, string> = {
  [PriorityLevel.Low]: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  [PriorityLevel.Medium]: 'bg-amber-50 text-amber-800 border-amber-200',
  [PriorityLevel.High]: 'bg-orange-50 text-orange-800 border-orange-200',
  [PriorityLevel.Critical]: 'bg-red-50 text-red-800 border-red-200',
};

/** Monday 00:00 local of the week containing `ref`. */
export function startOfWeekMonday(ref = new Date()) {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function completionDayKey(task: TaskItem) {
  if (!task.isCompleted) return null;
  if (task.completedAt) return toDateKey(task.completedAt);
  if (task.updatedAt) return toDateKey(task.updatedAt);
  return null;
}

export function countCompletedThisWeek(tasks: TaskItem[], ref = new Date()) {
  const start = startOfWeekMonday(ref);
  const end = addDays(start, 7);
  let count = 0;
  for (const task of tasks) {
    if (!task.isCompleted) continue;
    const raw = task.completedAt || task.updatedAt;
    if (!raw) continue;
    const t = new Date(raw);
    if (t >= start && t < end) count += 1;
  }
  return count;
}

export function weeklyProgress(
  tasks: TaskItem[],
  weeklyGoal = DEFAULT_WEEKLY_GOAL,
  ref = new Date()
) {
  const goal = weeklyGoal > 0 ? weeklyGoal : DEFAULT_WEEKLY_GOAL;
  const completed = countCompletedThisWeek(tasks, ref);
  const percent = Math.min(100, Math.round((completed / goal) * 100));
  return { completed, goal, percent };
}

export type DayBar = { key: string; label: string; count: number };

export function productivityByDay(tasks: TaskItem[], ref = new Date()): DayBar[] {
  const start = startOfWeekMonday(ref);
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = new Map<string, number>();

  for (let i = 0; i < 7; i++) {
    counts.set(toDateKey(addDays(start, i)), 0);
  }

  for (const task of tasks) {
    const key = completionDayKey(task);
    if (key && counts.has(key)) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return labels.map((label, i) => {
    const key = toDateKey(addDays(start, i));
    return { key, label, count: counts.get(key) || 0 };
  });
}

/**
 * Consecutive days with ≥1 completion.
 * If today has none yet, streak may still count from yesterday.
 */
export function computeStreak(tasks: TaskItem[], ref = new Date()) {
  const daysWithCompletion = new Set<string>();
  for (const task of tasks) {
    const key = completionDayKey(task);
    if (key) daysWithCompletion.add(key);
  }

  if (daysWithCompletion.size === 0) return 0;

  const today = new Date(ref);
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);

  if (!daysWithCompletion.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!daysWithCompletion.has(toDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (daysWithCompletion.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Today's Focus v1:
 * unfinished → pinned first → prefer due today, then no due → highest priority.
 */
export function getTodaysFocus(tasks: TaskItem[], ref = new Date()): TaskItem | null {
  const unfinished = tasks.filter((t) => !t.isCompleted);
  if (unfinished.length === 0) return null;

  const pinned = unfinished.find((t) => t.isPinnedFocus);
  if (pinned) return pinned;

  const todayKey = toDateKey(ref);

  const preferred = unfinished.filter((t) => {
    if (!t.dueDate) return true;
    return toDateKey(t.dueDate) === todayKey;
  });

  const pool = preferred.length > 0 ? preferred : unfinished;

  return [...pool].sort((a, b) => {
    const dueScore = (t: TaskItem) => {
      if (!t.dueDate) return 1;
      return toDateKey(t.dueDate) === todayKey ? 0 : 2;
    };
    const byDue = dueScore(a) - dueScore(b);
    if (byDue !== 0) return byDue;
    return b.priority - a.priority;
  })[0];
}

export function monthlyCompletion(
  tasks: TaskItem[],
  weeklyGoal = DEFAULT_WEEKLY_GOAL,
  ref = new Date()
) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const completed = tasks.filter((t) => {
    if (!t.isCompleted) return false;
    const raw = t.completedAt || t.updatedAt;
    if (!raw) return false;
    const d = new Date(raw);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;

  const goal = Math.max(1, Math.round(weeklyGoal * 4.3));
  return {
    completed,
    goal,
    monthLabel: ref.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

export function formatMinutesClock(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatScheduleRange(
  startMinutes?: number | null,
  endMinutes?: number | null
) {
  if (startMinutes == null || endMinutes == null) return null;
  return `${formatMinutesClock(startMinutes)} – ${formatMinutesClock(endMinutes)}`;
}

export function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function remainingTasksToday(tasks: TaskItem[], ref = new Date()) {
  const todayKey = toDateKey(ref);
  return tasks.filter(
    (t) =>
      !t.isCompleted && t.dueDate && toDateKey(t.dueDate) === todayKey
  ).length;
}

export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
