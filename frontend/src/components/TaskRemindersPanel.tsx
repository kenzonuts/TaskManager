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
    <div className="border-t border-white/10 pt-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-medium text-slate-200">Reminders</h3>
      </div>

      {error && (
        <p className="text-xs text-red-300 mb-2">{error}</p>
      )}

      {loading ? (
        <p className="text-xs text-slate-400">Loading reminders...</p>
      ) : reminders.length === 0 ? (
        <p className="text-xs text-slate-500 mb-3">Belum ada reminder untuk task ini.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {reminders.map((reminder) => (
            <li
              key={reminder.reminderId}
              className="flex items-center justify-between gap-2 rounded-lg bg-slate-700/60 px-3 py-2"
            >
              <span className="text-sm text-slate-200">
                {new Date(reminder.remindAt).toLocaleString()}
                {reminder.isSent ? ' · sent' : ''}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(reminder.reminderId)}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                aria-label="Delete reminder"
              >
                <Trash2 className="w-4 h-4" />
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
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        <button
          type="submit"
          disabled={saving || !remindAt}
          className="inline-flex items-center gap-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>
    </div>
  );
};
