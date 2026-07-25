import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category, PriorityLevel, TaskItem } from '../types';
import { X, Calendar, Tag, Clock } from 'lucide-react';
import { createTask } from '../api/tasks';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onTaskCreated: (newTask: TaskItem) => void;
}

const fieldClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100';
const labelClass = 'mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300';

function timeToMinutes(value: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  categories,
  onTaskCreated,
}: CreateTaskModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.Medium);
  const [categoryId, setCategoryId] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority(PriorityLevel.Medium);
    setCategoryId('');
    setEstimatedMinutes('');
    setScheduleStart('');
    setScheduleEnd('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const est = estimatedMinutes.trim()
      ? Number.parseInt(estimatedMinutes, 10)
      : null;
    const startMin = timeToMinutes(scheduleStart);
    const endMin = timeToMinutes(scheduleEnd);

    setIsSubmitting(true);
    try {
      const result = await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        categoryId: categoryId || null,
        estimatedMinutes: est != null && !Number.isNaN(est) ? est : null,
        scheduleStartMinutes: startMin,
        scheduleEndMinutes: endMin,
      });

      const newTask: TaskItem = {
        taskId: result.id,
        title: title.trim(),
        description: description.trim() || undefined,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        userId: user.userId,
        categoryId: categoryId || undefined,
        category: categories.find((c) => c.categoryId === categoryId),
        reminders: [],
        estimatedMinutes: est != null && !Number.isNaN(est) ? est : null,
        scheduleStartMinutes: startMin,
        scheduleEndMinutes: endMin,
        isPinnedFocus: false,
        trackingStartedAt: null,
        trackingElapsedSeconds: 0,
      };

      onTaskCreated(newTask);
      onClose();
      reset();
    } catch {
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Create New Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${fieldClass} resize-none`}
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          <div>
            <label className={labelClass}>Due Date</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Schedule start</label>
              <input
                type="time"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Schedule end</label>
              <input
                type="time"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Estimated minutes</label>
            <input
              type="number"
              min={1}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 45"
            />
          </div>

          <div>
            <label className={labelClass}>Priority</label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as PriorityLevel)}
                className={`${fieldClass} pl-10`}
              >
                <option value={PriorityLevel.Low}>Low</option>
                <option value={PriorityLevel.Medium}>Medium</option>
                <option value={PriorityLevel.High}>High</option>
                <option value={PriorityLevel.Critical}>Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`${fieldClass} pl-10`}
              >
                <option value="">No Category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
