import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dummyTasks } from '../data/dummyData';
import { TaskCard } from '../components/TaskCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { StatsCard } from '../components/StatsCard';
import { Category } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  LogOut,
  Menu,
  X,
  User,
} 
from 'lucide-react';

export const Dashboard = () => {
  const { user, logout, getAuthToken } = useAuth();
  const [tasks, setTasks] = useState(dummyTasks);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;

      try {
        const token = getAuthToken();
        const response = await fetch('http://localhost:5091/api/Categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        if (response.ok) {
          const categoriesData: Category[] = await response.json();
          setCategories(categoriesData);
        } else {
          console.error('Failed to fetch categories:', response.status);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user, getAuthToken]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.userId === user?.userId);

    if (selectedCategory) {
      filtered = filtered.filter((task) => task.categoryId === selectedCategory);
    }

    if (!showCompleted) {
      filtered = filtered.filter((task) => !task.isCompleted);
    }

    return filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return b.priority - a.priority;
    });
  }, [tasks, selectedCategory, showCompleted, user]);

  const userCategories = categories.filter((cat) => cat.userId === user?.userId);

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks
      .filter((task) => task.userId === user?.userId)
      .forEach((task) => {
        if (task.categoryId) {
          counts[task.categoryId] = (counts[task.categoryId] || 0) + 1;
        }
      });
    return counts;
  }, [tasks, user]);

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

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.taskId === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">NebulaCore</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Task Management</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-lg">
                  <User className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all border border-red-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
                <User className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all border border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.username}!</h2>
            <p className="text-slate-300">Here's what you need to do today</p>
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
            />
            <StatsCard
              title="In Progress"
              value={stats.pending}
              icon={Clock}
              color="text-yellow-400"
              bgColor="bg-yellow-500/20"
            />
            <StatsCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertCircle}
              color="text-red-400"
              bgColor="bg-red-500/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <CategoryFilter
                categories={userCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                taskCounts={taskCounts}
                onCategoryCreated={handleCategoryCreated}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedCategory
                      ? userCategories.find((c) => c.categoryId === selectedCategory)?.name
                      : 'All Tasks'}
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCompleted}
                      onChange={(e) => setShowCompleted(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-300">Show completed</span>
                  </label>
                </div>

                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <ListTodo className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">No tasks found</p>
                      <p className="text-slate-500 text-sm mt-2">
                        {showCompleted
                          ? 'Try selecting a different category'
                          : 'Enable "Show completed" to see all tasks'}
                      </p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <TaskCard key={task.taskId} task={task} onToggle={handleToggleTask} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
