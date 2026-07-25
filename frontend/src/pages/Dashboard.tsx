import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/StatsCard';
import { TaskCard } from '../components/TaskCard';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskItem } from '../types';
import { getUserTasks } from '../api/tasks';

export const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      try {
        const tasksData = await getUserTasks();
        if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
      } catch {
        // ignore; empty dashboard
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const stats = useMemo(() => {
    const userTasks = tasks.filter((task) => task.userId === user?.userId);
    const completed = userTasks.filter((task) => task.isCompleted).length;
    const pending = userTasks.filter((task) => !task.isCompleted).length;
    const overdue = userTasks.filter(
      (task) =>
        !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
    ).length;

    return { total: userTasks.length, completed, pending, overdue };
  }, [tasks, user]);

  const recentTasks = useMemo(() => {
    const userTasks = tasks.filter((task) => task.userId === user?.userId);
    return userTasks
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      })
      .slice(0, 5);
  }, [tasks, user]);

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.taskId === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Welcome back, {user?.username}!
        </h2>
        <p className="text-zinc-500">Here&apos;s an overview of your tasks and progress.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Recent Tasks</h3>
          <Link
            to="/tasks"
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <span>View All Tasks</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
              <ListTodo className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
              <p className="text-lg font-medium text-zinc-800">No tasks yet</p>
              <p className="mt-1 text-sm text-zinc-500">
                Create your first task to get started.
              </p>
              <Link
                to="/tasks"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <span>Go to Tasks</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            recentTasks.map((task) => (
              <TaskCard
                key={task.taskId}
                task={task}
                onToggle={handleToggleTask}
                onEdit={() => {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
