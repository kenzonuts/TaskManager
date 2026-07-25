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
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.username}!</h2>
          <p className="text-slate-300">Here&apos;s an overview of your tasks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Tasks"
            value={stats.total}
            icon={ListTodo}
            color="text-cyan-400"
            bgColor="bg-cyan-500/20"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="text-emerald-400"
            bgColor="bg-emerald-500/20"
            filter="completed"
          />
          <StatsCard
            title="In Progress"
            value={stats.pending}
            icon={Clock}
            color="text-yellow-400"
            bgColor="bg-yellow-500/20"
            filter="pending"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertCircle}
            color="text-red-400"
            bgColor="bg-red-500/20"
            filter="overdue"
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Tasks</h3>
            <Link
              to="/tasks"
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span className="text-sm font-medium">View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl">
                <ListTodo className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No tasks yet</p>
                <p className="text-slate-500 text-sm mt-2">Create your first task to get started</p>
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all border border-cyan-500/30"
                >
                  <span>Go to Tasks</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              recentTasks.map((task) => (
                <TaskCard key={task.taskId} task={task} onToggle={handleToggleTask} onEdit={() => {}} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
