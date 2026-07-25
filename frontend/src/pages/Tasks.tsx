import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { Category, TaskItem } from '../types';
import { ListTodo, Plus } from 'lucide-react';
import { getCategories } from '../api/categories';
import { getUserTasks, updateTaskCompletion } from '../api/tasks';

export const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const [categoriesData, tasksData] = await Promise.all([
          getCategories(),
          getUserTasks(),
        ]);
        setCategories(categoriesData);
        if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
      } catch {
        // leave empty on failure
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.userId === user?.userId);

    if (filterParam === 'completed') {
      filtered = filtered.filter((task) => task.isCompleted);
    } else if (filterParam === 'pending') {
      filtered = filtered.filter((task) => !task.isCompleted);
    } else if (filterParam === 'overdue') {
      filtered = filtered.filter(
        (task) => !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((task) => task.categoryId === selectedCategory);
    }

    if (!showCompleted && !filterParam) {
      filtered = filtered.filter((task) => !task.isCompleted);
    }

    return filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return b.priority - a.priority;
    });
  }, [tasks, selectedCategory, showCompleted, user, filterParam]);

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

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.taskId === taskId);
    if (!task) return;

    const newCompletedStatus = !task.isCompleted;
    try {
      await updateTaskCompletion(taskId, newCompletedStatus);
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === taskId ? { ...t, isCompleted: newCompletedStatus } : t
        )
      );
    } catch {
      alert('Gagal mengubah status penyelesaian tugas. Silakan coba lagi.');
    }
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleTaskCreated = (newTask: TaskItem) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask: TaskItem) => {
    setTasks((prev) =>
      prev.map((task) => (task.taskId === updatedTask.taskId ? updatedTask : task))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Tasks</h2>
            <p className="text-slate-300">Kelola semua tugas Anda di sini</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <CategoryFilter
                categories={categories}
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
                      ? categories.find((c) => c.categoryId === selectedCategory)?.name
                      : 'All Tasks'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCreateTaskModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Task</span>
                    </button>
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
                      <TaskCard
                        key={task.taskId}
                        task={task}
                        onToggle={handleToggleTask}
                        onEdit={handleEditTask}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        categories={categories}
        onTaskCreated={handleTaskCreated}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setEditingTask(null);
        }}
        categories={categories}
        task={editingTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};
