import { useEffect, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import * as remindersApi from '../api/reminders';
import { ApiError } from '../api/client';

interface TaskRemindersPanelProps {
  taskId: string;
}

export const TaskRemindersPanel = ({ taskId }: TaskRemindersPanelProps) => {
  const [reminders, setReminders] = useState<remindersApi.ReminderDto[]>([]);
  const [remindAt, setRemindAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await remindersApi.getRemindersByTask(taskId);
      setReminders(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setReminders([]);
      } else {
        setError('Gagal memuat reminder.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [taskId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remindAt) return;
    setSaving(true);
    setError('');
    try {
      await remindersApi.createReminder(taskId, new Date(remindAt).toISOString());
      setRemindAt('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menambah reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reminderId: string) => {
    try {
      await remindersApi.deleteReminder(reminderId);
      setReminders((prev) => prev.filter((r) => r.reminderId !== reminderId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menghapus reminder.');
    }
  };

  return (
    <div className="mt-2 border-t border-zinc-100 pt-4">
      <div className="mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-zinc-700" />
        <h3 className="text-sm font-medium text-zinc-800">Reminders</h3>
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {loading ? (
        <p className="text-xs text-zinc-500">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="mb-3 text-xs text-zinc-500">Belum ada reminder untuk task ini.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {reminders.map((reminder) => (
            <li
              key={reminder.reminderId}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
            >
              <span className="text-sm text-zinc-700">
                {new Date(reminder.remindAt).toLocaleString()}
                {reminder.isSent ? ' · sent' : ''}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(reminder.reminderId)}
                className="rounded p-1 text-zinc-400 transition-colors hover:text-red-600"
                aria-label="Delete reminder"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="datetime-local"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          required
        />
        <button
          type="submit"
          disabled={saving || !remindAt}
          className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>
    </div>
  );
};
