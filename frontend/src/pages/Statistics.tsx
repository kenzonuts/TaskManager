import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TaskItem } from '../types';
import { getUserTasks } from '../api/tasks';
import { StatsCard } from '../components/StatsCard';
import { WeeklyProgressRing } from '../components/dashboard/WeeklyProgressRing';
import { ProductivityChart } from '../components/dashboard/ProductivityChart';
import { ProductivityStreak } from '../components/dashboard/ProductivityStreak';
import { MonthlyCompletion } from '../components/dashboard/MonthlyCompletion';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
} from 'lucide-react';
import {
  computeStats,
  computeStreak,
  DEFAULT_WEEKLY_GOAL,
  monthlyCompletion,
  productivityByDay,
  userTasks,
  weeklyProgress,
} from '../utils/taskQueries';

export const Statistics = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

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
  const weeklyGoal = user?.weeklyGoal ?? DEFAULT_WEEKLY_GOAL;
  const stats = useMemo(() => computeStats(scoped), [scoped]);
  const progress = useMemo(() => weeklyProgress(scoped, weeklyGoal), [scoped, weeklyGoal]);
  const chartDays = useMemo(() => productivityByDay(scoped), [scoped]);
  const streak = useMemo(() => computeStreak(scoped), [scoped]);
  const monthly = useMemo(() => monthlyCompletion(scoped, weeklyGoal), [scoped, weeklyGoal]);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-zinc-500">Loading statistics...</div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Statistics
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Completion trends and goals from your real task data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total Tasks" value={stats.total} icon={ListTodo} />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatsCard title="In Progress" value={stats.pending} icon={Clock} />
        <StatsCard title="Overdue" value={stats.overdue} icon={AlertCircle} />
        <WeeklyProgressRing
          completed={progress.completed}
          goal={progress.goal}
          percent={progress.percent}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductivityChart days={chartDays} />
        <MonthlyCompletion
          completed={monthly.completed}
          goal={monthly.goal}
          monthLabel={monthly.monthLabel}
        />
      </div>

      <ProductivityStreak days={streak} />
    </div>
  );
};
