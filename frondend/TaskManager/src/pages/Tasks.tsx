import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TaskCard } from '../components/TaskCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { Category, TaskItem } from '../types';
import {
  ListTodo,
  Plus,
}
from 'lucide-react';

export const Tasks = () => {
  const { user, getAuthToken } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Get URL parameters for filtering
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');

  useEffect(() => {
    console.log('Tasks useEffect triggered, user:', user);
    console.log('User ID:', user?.userId);

    const fetchCategories = async () => {
      if (!user) {
        console.log('No user, skipping fetch categories');
        return;
      }

      try {
        const token = getAuthToken();
        console.log('Fetching categories with token:', token ? 'present' : 'missing');
        const response = await fetch('http://localhost:5091/api/Categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        console.log('Categories fetch response status:', response.status);
        if (response.ok) {
          const categoriesData: Category[] = await response.json();
          console.log('Categories data received:', categoriesData);
          setCategories(categoriesData);
        } else {
          console.error('Failed to fetch categories:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      if (!user) {
        console.log('No user logged in, skipping fetch tasks');
        return;
      }

      try {
        const token = getAuthToken();
        console.log('Fetching tasks with token:', token ? 'present' : 'missing');
        console.log('Token value:', token);
        const response = await fetch('http://localhost:5091/api/TaskCategory/GetUserTasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        });

        console.log('Tasks fetch response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        if (response.ok) {
          const tasksData = await response.json();
          console.log('Tasks data received:', tasksData);
          console.log('Tasks data type:', typeof tasksData, Array.isArray(tasksData));
          if (Array.isArray(tasksData)) {
            setTasks(tasksData);
          } else {
            console.error('Tasks data is not an array:', tasksData);
            alert('Tasks data format is incorrect. Expected array.');
          }
        } else {
          console.error('Failed to fetch tasks:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          alert(`Failed to fetch tasks: ${response.status} ${response.statusText}\n${errorText}`);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        alert(`Error fetching tasks: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    fetchCategories();
    fetchTasks();
  }, [user, getAuthToken]);

  const filteredTasks = useMemo(() => {
    console.log('Filtering tasks, total tasks:', tasks.length);
    console.log('User ID for filtering:', user?.userId);
    console.log('Filter param:', filterParam);
    let filtered = tasks.filter((task) => {
      const matches = task.userId === user?.userId;
      console.log(`Task ${task.taskId} userId: ${task.userId}, matches: ${matches}`);
      return matches;
    });
    console.log('Tasks after user filter:', filtered.length);

    // Apply URL filter parameter
    if (filterParam === 'completed') {
      filtered = filtered.filter((task) => task.isCompleted);
      console.log('Tasks after completed filter:', filtered.length);
    } else if (filterParam === 'pending') {
      filtered = filtered.filter((task) => !task.isCompleted);
      console.log('Tasks after pending filter:', filtered.length);
    } else if (filterParam === 'overdue') {
      filtered = filtered.filter((task) =>
        !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date()
      );
      console.log('Tasks after overdue filter:', filtered.length);
    }

    if (selectedCategory) {
      filtered = filtered.filter((task) => task.categoryId === selectedCategory);
      console.log('Tasks after category filter:', filtered.length);
    }

    if (!showCompleted && !filterParam) {
      filtered = filtered.filter((task) => !task.isCompleted);
      console.log('Tasks after completed filter:', filtered.length);
    }

    const sorted = filtered.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      return b.priority - a.priority;
    });
    console.log('Final filtered tasks:', sorted.length);
    return sorted;
  }, [tasks, selectedCategory, showCompleted, user, filterParam]);

  const userCategories = categories;

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
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;

    const newCompletedStatus = !task.isCompleted;

    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5091/api/TaskCategory/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          taskId: taskId,
          isCompleted: newCompletedStatus,
        }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task.taskId === taskId ? { ...task, isCompleted: newCompletedStatus } : task
          )
        );
      } else {
        console.error('Failed to toggle task completion:', response.status);
        alert('Gagal mengubah status penyelesaian tugas. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      alert('Error mengubah status penyelesaian tugas. Silakan coba lagi.');
    }
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  const handleTaskCreated = (newTask: any) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask: TaskItem) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.taskId === updatedTask.taskId ? updatedTask : task
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Tasks</h2>
            <p className="text-slate-300">Kelola semua tugas Anda di sini</p>
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
                      <TaskCard key={task.taskId} task={task} onToggle={handleToggleTask} onEdit={handleEditTask} />
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
        categories={userCategories}
        onTaskCreated={handleTaskCreated}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setEditingTask(null);
        }}
        categories={userCategories}
        task={editingTask}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
};
