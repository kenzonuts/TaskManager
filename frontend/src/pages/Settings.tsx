import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as usersApi from '../api/users';
import { Folder } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateLocalUser, authProvider } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState(user?.username ?? '');
  const [weeklyGoal, setWeeklyGoal] = useState(String(user?.weeklyGoal ?? 20));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const goal = Number.parseInt(weeklyGoal, 10);
    if (!username.trim() || Number.isNaN(goal) || goal < 1) {
      setMessage('Enter a valid username and weekly goal (1–500).');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const result = await usersApi.updateSettings({
        username: username.trim(),
        weeklyGoal: goal,
      });
      updateLocalUser({
        username: result.username,
        weeklyGoal: result.weeklyGoal,
      });
      setMessage('Settings saved.');
    } catch {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Profile, goals, and appearance.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profile</h3>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            value={user?.email ?? ''}
            disabled
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Weekly goal (tasks)
          </label>
          <input
            type="number"
            min={1}
            max={500}
            value={weeklyGoal}
            onChange={(e) => setWeeklyGoal(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>
        <p className="text-xs text-zinc-500">Auth provider: {authProvider}</p>
        {message && (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Appearance</h3>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Switch to {theme === 'dark' ? 'light' : 'dark'} mode
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Categories
        </h3>
        <p className="mb-3 text-sm text-zinc-500">
          Categories remain available for tagging tasks alongside projects.
        </p>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
        >
          <Folder className="h-4 w-4" />
          Manage categories
        </Link>
      </div>
    </div>
  );
};
