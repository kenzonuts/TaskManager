import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  ArrowRight,
  Circle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/StatsCard';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { MiniCalendar } from '../components/dashboard/MiniCalendar';
import { QuickActions } from '../components/dashboard/QuickActions';
import { Category, TaskItem } from '../types';
import { getUserTasks, updateTaskCompletion } from '../api/tasks';
import { getCategories } from '../api/categories';
import {
  computeStats,
  formatRelativeTime,
  getRecentTasks,
  getUpcomingDeadlines,
  userTasks,
} from '../utils/taskQueries';

export const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [tasksData, categoriesData] = await Promise.all([
          getUserTasks(),
          getCategories(),
        ]);
        if (Array.isArray(tasksData)) setTasks(tasksData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
      } catch {
        // empty dashboard on failure
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const scoped = useMemo(
    () => userTasks(tasks, user?.userId),
    [tasks, user?.userId]
  );

  const stats = useMemo(() => computeStats(scoped), [scoped]);
  const upcoming = useMemo(() => getUpcomingDeadlines(scoped, 6), [scoped]);
  const recent = useMemo(() => getRecentTasks(scoped, 6), [scoped]);

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return;
    const next = !task.isCompleted;
    try {
      await updateTaskCompletion(taskId, next);
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === taskId ? { ...t, isCompleted: next } : t
        )
      );
    } catch {
      alert('Failed to update task status.');
    }
  };

  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-zinc-500">
          Here&apos;s an overview of your tasks and progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Tasks" value={stats.total} icon={ListTodo} />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          filter="completed"
        />
        <StatsCard
          title="In Progress"
          value={stats.pending}
          icon={Clock}
          filter="pending"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertCircle}
          filter="overdue"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <UpcomingDeadlines tasks={upcoming} />
        </div>
        <div className="lg:col-span-2">
          <MiniCalendar tasks={scoped} />
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Recent Tasks</h3>
          <Link
            to="/tasks"
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <span>View All Tasks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {scoped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <ListTodo className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-800">No tasks yet</p>
            <p className="mt-1 text-sm text-zinc-500">
              Create your first task to get started.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              + Create Task
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <ul className="divide-y divide-zinc-100">
              {recent.map((task) => (
                <li
                  key={task.taskId}
                  className="flex items-center gap-3 px-4 py-3 sm:px-5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.taskId)}
                    className="shrink-0"
                    aria-label={
                      task.isCompleted ? 'Mark incomplete' : 'Mark complete'
                    }
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-400 hover:text-zinc-900" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        task.isCompleted
                          ? 'text-zinc-400 line-through'
                          : 'text-zinc-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {task.isCompleted ? 'Completed' : 'In Progress'} ·{' '}
                      {formatRelativeTime(task.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <QuickActions onNewTask={() => setCreateOpen(true)} />

      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
