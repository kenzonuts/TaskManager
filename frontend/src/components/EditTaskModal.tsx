import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category, PriorityLevel, Project, TaskItem } from '../types';
import { X, Calendar, Tag, Clock, FolderKanban } from 'lucide-react';
import { updateTask } from '../api/tasks';
import * as projectsApi from '../api/projects';
import { TaskRemindersPanel } from './TaskRemindersPanel';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  task: TaskItem | null;
  onTaskUpdated: (updatedTask: TaskItem) => void;
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

function minutesToTime(mins?: number | null) {
  if (mins == null) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const EditTaskModal = ({
  isOpen,
  onClose,
  categories,
  task,
  onTaskUpdated,
}: EditTaskModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.Medium);
  const [categoryId, setCategoryId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [isPinnedFocus, setIsPinnedFocus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    void projectsApi
      .getProjects()
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => setProjects([]));
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
      setPriority(task.priority);
      setCategoryId(task.categoryId || '');
      setProjectId(task.projectId || '');
      setEstimatedMinutes(
        task.estimatedMinutes != null ? String(task.estimatedMinutes) : ''
      );
      setScheduleStart(minutesToTime(task.scheduleStartMinutes));
      setScheduleEnd(minutesToTime(task.scheduleEndMinutes));
      setIsPinnedFocus(!!task.isPinnedFocus);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !task || !user) return;

    const est = estimatedMinutes.trim()
      ? Number.parseInt(estimatedMinutes, 10)
      : null;
    const startMin = timeToMinutes(scheduleStart);
    const endMin = timeToMinutes(scheduleEnd);

    setIsSubmitting(true);
    try {
      await updateTask(task.taskId, {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        categoryId: categoryId || null,
        projectId: projectId || null,
        estimatedMinutes: est != null && !Number.isNaN(est) ? est : null,
        scheduleStartMinutes: startMin,
        scheduleEndMinutes: endMin,
        isPinnedFocus,
      });

      onTaskUpdated({
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        categoryId: categoryId || undefined,
        projectId: projectId || undefined,
        category: categories.find((c) => c.categoryId === categoryId),
        project: projects.find((p) => p.projectId === projectId),
        estimatedMinutes: est != null && !Number.isNaN(est) ? est : null,
        scheduleStartMinutes: startMin,
        scheduleEndMinutes: endMin,
        isPinnedFocus,
        updatedAt: new Date(),
      });
      onClose();
    } catch {
      alert('Gagal mengupdate tugas. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Edit Task
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

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={isPinnedFocus}
              onChange={(e) => setIsPinnedFocus(e.target.checked)}
              className="rounded border-zinc-300"
            />
            Pin as Today&apos;s Focus
          </label>

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
            <label className={labelClass}>Project</label>
            <div className="relative">
              <FolderKanban className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`${fieldClass} pl-10`}
              >
                <option value="">No Project</option>
                {projects.map((project) => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.name}
                  </option>
                ))}
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

          <TaskRemindersPanel taskId={task.taskId} />

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
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
