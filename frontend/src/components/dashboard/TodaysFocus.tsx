import { useEffect, useMemo, useState } from 'react';
import {
  Star,
  Pin,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { TaskItem } from '../../types';
import {
  formatElapsed,
  formatScheduleRange,
  priorityBadgeClass,
  priorityLabels,
} from '../../utils/taskQueries';
import * as tasksApi from '../../api/tasks';

interface TodaysFocusProps {
  task: TaskItem | null;
  onComplete?: (taskId: string) => void;
  onTaskPatched?: (task: TaskItem) => void;
}

const POMODORO_SECONDS = 25 * 60;

function liveElapsed(task: TaskItem, now: number) {
  const base = task.trackingElapsedSeconds ?? 0;
  if (!task.trackingStartedAt) return base;
  const started = new Date(task.trackingStartedAt).getTime();
  return base + Math.max(0, Math.floor((now - started) / 1000));
}

export const TodaysFocus = ({
  task,
  onComplete,
  onTaskPatched,
}: TodaysFocusProps) => {
  const [now, setNow] = useState(Date.now());
  const [pomodoroLeft, setPomodoroLeft] = useState(POMODORO_SECONDS);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!pomodoroRunning) return;
    const id = window.setInterval(() => {
      setPomodoroLeft((s) => {
        if (s <= 1) {
          setPomodoroRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [pomodoroRunning]);

  useEffect(() => {
    setPomodoroRunning(false);
    setPomodoroLeft(POMODORO_SECONDS);
  }, [task?.taskId]);

  const elapsed = useMemo(
    () => (task ? liveElapsed(task, now) : 0),
    [task, now]
  );

  const schedule = task
    ? formatScheduleRange(task.scheduleStartMinutes, task.scheduleEndMinutes)
    : null;

  const remainingEstimate =
    task?.estimatedMinutes != null
      ? Math.max(0, task.estimatedMinutes * 60 - elapsed)
      : null;

  const handlePin = async () => {
    if (!task || busy) return;
    setBusy(true);
    try {
      const next = !task.isPinnedFocus;
      await tasksApi.pinFocus(task.taskId, next);
      onTaskPatched?.({ ...task, isPinnedFocus: next, updatedAt: new Date() });
    } catch {
      alert('Failed to pin focus task.');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleTracking = async () => {
    if (!task || busy) return;
    setBusy(true);
    try {
      if (task.trackingStartedAt) {
        await tasksApi.stopTracking(task.taskId);
        onTaskPatched?.({
          ...task,
          trackingStartedAt: null,
          trackingElapsedSeconds: elapsed,
          updatedAt: new Date(),
        });
      } else {
        await tasksApi.startTracking(task.taskId);
        onTaskPatched?.({
          ...task,
          trackingStartedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch {
      alert('Failed to update time tracking.');
    } finally {
      setBusy(false);
    }
  };

  const pomoMin = Math.floor(pomodoroLeft / 60);
  const pomoSec = pomodoroLeft % 60;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-zinc-900 dark:text-zinc-100" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Today&apos;s Focus
          </h3>
        </div>
        {task && (
          <button
            type="button"
            onClick={handlePin}
            disabled={busy}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
              task.isPinnedFocus
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
            aria-pressed={!!task.isPinnedFocus}
          >
            <Pin className="h-3 w-3" />
            {task.isPinnedFocus ? 'Pinned' : 'Pin'}
          </button>
        )}
      </div>

      {!task ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            All clear
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            No unfinished tasks to focus on right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {task.title}
            </p>
            {task.description && (
              <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                {task.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                  priorityBadgeClass[task.priority]
                }`}
              >
                {priorityLabels[task.priority]} Priority
              </span>
              {schedule && (
                <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-600 dark:text-zinc-300">
                  {schedule}
                </span>
              )}
              {task.estimatedMinutes != null && (
                <span className="rounded-md border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-600 dark:text-zinc-300">
                  Est. {task.estimatedMinutes}m
                  {remainingEstimate != null &&
                    ` · left ${formatElapsed(remainingEstimate).slice(0, 5)}`}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/60">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Time tracking
              </p>
              <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatElapsed(elapsed)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleTracking}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {task.trackingStartedAt ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> Stop
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Start
                </>
              )}
            </button>
          </div>

          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/60">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <Timer className="h-3.5 w-3.5" />
                Pomodoro
              </p>
              <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {String(pomoMin).padStart(2, '0')}:
                {String(pomoSec).padStart(2, '0')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPomodoroRunning((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {pomodoroRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />{' '}
                    {pomodoroLeft === 0 ? 'Restart' : 'Start'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPomodoroRunning(false);
                  setPomodoroLeft(POMODORO_SECONDS);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>

          {onComplete && (
            <button
              type="button"
              onClick={() => onComplete(task.taskId)}
              className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Mark done
            </button>
          )}
        </div>
      )}
    </div>
  );
};
