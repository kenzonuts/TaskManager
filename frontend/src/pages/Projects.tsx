import { useEffect, useState } from 'react';
import { FolderKanban, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types';
import * as projectsApi from '../api/projects';
import { ApiError } from '../api/client';

const COLORS = ['#18181b', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];

export const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      const data = await projectsApi.getProjects();
      if (Array.isArray(data)) setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setColor(COLORS[0]);
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setName(p.name);
    setDescription(p.description || '');
    setColor(p.color || COLORS[0]);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      if (editing) {
        await projectsApi.updateProject(editing.projectId, {
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
        setProjects((prev) =>
          prev.map((p) =>
            p.projectId === editing.projectId
              ? {
                  ...p,
                  name: name.trim(),
                  description: description.trim() || null,
                  color,
                }
              : p
          )
        );
      } else {
        const result = await projectsApi.createProject({
          name: name.trim(),
          description: description.trim() || null,
          color,
        });
        setProjects((prev) => [
          {
            projectId: result.id,
            name: name.trim(),
            description: description.trim() || null,
            color,
            userId: user.userId,
            createdAt: new Date(),
            taskCount: 0,
            completedTaskCount: 0,
          },
          ...prev,
        ]);
      }
      setModalOpen(false);
    } catch {
      alert('Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await projectsApi.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.projectId !== projectId));
    } catch (error) {
      let msg = 'Failed to delete project.';
      if (error instanceof ApiError && error.message) msg = error.message;
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-zinc-500">Loading projects...</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Projects
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Group related work beyond categories.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <FolderKanban className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
          <p className="font-medium text-zinc-800 dark:text-zinc-200">No projects yet</p>
          <p className="mt-1 text-sm text-zinc-500">Create your first project to organize tasks.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => {
            const total = p.taskCount ?? 0;
            const done = p.completedTaskCount ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <li
                key={p.projectId}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color || '#18181b' }}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                        {p.name}
                      </p>
                      {p.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      aria-label="Edit project"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.projectId)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-rose-600 dark:hover:bg-zinc-800"
                      aria-label="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mb-2 text-xs text-zinc-500">
                  {done}/{total} tasks · {pct}%
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {editing ? 'Edit Project' : 'New Project'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full border-2 ${
                        color === c ? 'border-zinc-900 dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-300 py-2 text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="flex-1 rounded-lg bg-zinc-900 py-2 font-semibold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
