import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Category, PriorityLevel, Project, TaskItem } from '../types';
import {
  X,
  Pencil,
  CalendarDays,
  FolderKanban,
  Sparkles,
  Check,
  Flag,
  Pin,
} from 'lucide-react';
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

const ESTIMATE_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
] as const;

const PRIORITY_OPTIONS: {
  value: PriorityLevel;
  label: string;
  hint: string;
  accent: string;
  selected: string;
}[] = [
  {
    value: PriorityLevel.Low,
    label: 'Low',
    hint: 'Nice to do when you have spare time.',
    accent: 'text-emerald-600',
    selected: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    value: PriorityLevel.Medium,
    label: 'Medium',
    hint: 'Important but not urgent.',
    accent: 'text-amber-500',
    selected: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40',
  },
  {
    value: PriorityLevel.High,
    label: 'High',
    hint: 'Should be done soon.',
    accent: 'text-orange-500',
    selected: 'border-orange-500 bg-orange-50 dark:bg-orange-950/40',
  },
  {
    value: PriorityLevel.Critical,
    label: 'Urgent',
    hint: 'Needs attention immediately.',
    accent: 'text-rose-600',
    selected: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40',
  },
];

const CATEGORY_DOTS = [
  '#3b82f6',
  '#eab308',
  '#a855f7',
  '#22c55e',
  '#f97316',
  '#06b6d4',
];

function categoryDot(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % CATEGORY_DOTS.length;
  return CATEGORY_DOTS[h];
}

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

function toDateInput(due?: Date | string) {
  if (!due) return '';
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-300 dark:focus:ring-zinc-100/10';

const chipBase =
  'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors';

const SectionTitle = ({
  icon: Icon,
  children,
}: {
  icon: typeof Pencil;
  children: React.ReactNode;
}) => (
  <div className="mb-3 flex items-center gap-2">
    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{children}</h3>
  </div>
);

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
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [estimateMode, setEstimateMode] = useState<'preset' | 'custom'>('preset');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(60);
  const [customEstimate, setCustomEstimate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.Medium);
  const [categoryId, setCategoryId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
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
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(toDateInput(task.dueDate));
    setScheduleStart(minutesToTime(task.scheduleStartMinutes));
    setScheduleEnd(minutesToTime(task.scheduleEndMinutes));
    setPriority(task.priority);
    setCategoryId(task.categoryId || '');
    setProjectId(task.projectId || '');
    setIsPinnedFocus(!!task.isPinnedFocus);

    const est = task.estimatedMinutes ?? null;
    const preset = ESTIMATE_PRESETS.find((p) => p.minutes === est);
    if (preset) {
      setEstimateMode('preset');
      setEstimatedMinutes(preset.minutes);
      setCustomEstimate('');
    } else if (est != null) {
      setEstimateMode('custom');
      setCustomEstimate(String(est));
      setEstimatedMinutes(null);
    } else {
      setEstimateMode('preset');
      setEstimatedMinutes(60);
      setCustomEstimate('');
    }
  }, [task]);

  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === priority);

  const submit = useCallback(async () => {
    if (!title.trim() || !task || !user || isSubmitting) return;

    const est =
      estimateMode === 'custom'
        ? customEstimate.trim()
          ? Number.parseInt(customEstimate, 10)
          : null
        : estimatedMinutes;

    const startMin = timeToMinutes(scheduleStart);
    const endMin = timeToMinutes(scheduleEnd);

    setIsSubmitting(true);
    try {
      await updateTask(task.taskId, {
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate
          ? new Date(`${dueDate}T${scheduleStart || '00:00'}:00`).toISOString()
          : null,
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
        dueDate: dueDate
          ? new Date(`${dueDate}T${scheduleStart || '00:00'}:00`)
          : undefined,
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
      alert('Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    task,
    user,
    isSubmitting,
    estimateMode,
    customEstimate,
    estimatedMinutes,
    scheduleStart,
    scheduleEnd,
    dueDate,
    priority,
    categoryId,
    projectId,
    isPinnedFocus,
    categories,
    projects,
    onTaskUpdated,
    onClose,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        void submit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, submit]);

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Edit Task
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Update schedule, organization, and reminders.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
            <span className="mt-0.5 block text-[10px] font-medium">Esc</span>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <SectionTitle icon={Pencil}>Basic Information</SectionTitle>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isPinnedFocus}
                    onChange={(e) => setIsPinnedFocus(e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  <Pin className="h-3.5 w-3.5" />
                  Pin as Today&apos;s Focus
                </label>
              </div>
            </section>

            <section>
              <SectionTitle icon={CalendarDays}>Schedule</SectionTitle>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Start
                    </label>
                    <input
                      type="time"
                      value={scheduleStart}
                      onChange={(e) => setScheduleStart(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      End
                    </label>
                    <input
                      type="time"
                      value={scheduleEnd}
                      onChange={(e) => setScheduleEnd(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Estimated Time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ESTIMATE_PRESETS.map((p) => {
                      const active =
                        estimateMode === 'preset' && estimatedMinutes === p.minutes;
                      return (
                        <button
                          key={p.minutes}
                          type="button"
                          onClick={() => {
                            setEstimateMode('preset');
                            setEstimatedMinutes(p.minutes);
                          }}
                          className={`${chipBase} ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setEstimateMode('custom')}
                      className={`${chipBase} ${
                        estimateMode === 'custom'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {estimateMode === 'custom' && (
                    <input
                      type="number"
                      min={1}
                      value={customEstimate}
                      onChange={(e) => setCustomEstimate(e.target.value)}
                      placeholder="Minutes"
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>

          <section>
            <SectionTitle icon={FolderKanban}>Organization</SectionTitle>
            <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Project
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setProjectId('')}
                      className={`${chipBase} ${
                        !projectId
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      None
                    </button>
                    {projects.map((p) => {
                      const active = projectId === p.projectId;
                      return (
                        <button
                          key={p.projectId}
                          type="button"
                          onClick={() => setProjectId(p.projectId)}
                          className={`${chipBase} ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: p.color || '#18181b' }}
                          />
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryId('')}
                      className={`${chipBase} ${
                        !categoryId
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      None
                    </button>
                    {categories.map((c) => {
                      const active = categoryId === c.categoryId;
                      return (
                        <button
                          key={c.categoryId}
                          type="button"
                          onClick={() => setCategoryId(c.categoryId)}
                          className={`${chipBase} ${
                            active
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: categoryDot(c.categoryId) }}
                          />
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="min-w-[14rem]">
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map((opt) => {
                    const active = priority === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        className={`rounded-xl border px-3 py-2.5 text-left transition ${
                          active
                            ? opt.selected
                            : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          <Flag className={`h-3.5 w-3.5 ${opt.accent}`} />
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {selectedPriority && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedPriority.hint}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section>
            <SectionTitle icon={Sparkles}>Reminders</SectionTitle>
            <TaskRemindersPanel taskId={task.taskId} />
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              disabled={isSubmitting || !title.trim()}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </button>
            <span className="text-[10px] text-zinc-400">Ctrl + Enter to save</span>
          </div>
        </div>
      </div>
    </div>
  );
};
