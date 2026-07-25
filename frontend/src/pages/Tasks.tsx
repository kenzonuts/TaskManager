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
      <div className="flex items-center justify-center py-24">
        <div className="text-lg text-zinc-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Tasks
        </h2>
        <p className="text-zinc-500">Manage all your tasks in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold text-zinc-900">
                {selectedCategory
                  ? categories.find((c) => c.categoryId === selectedCategory)?.name
                  : 'All Tasks'}
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showCompleted}
                    onChange={(e) => setShowCompleted(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-sm text-zinc-600">Show completed</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <ListTodo className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
                  <p className="text-lg font-medium text-zinc-800">No tasks found</p>
                  <p className="mt-1 text-sm text-zinc-500">
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
