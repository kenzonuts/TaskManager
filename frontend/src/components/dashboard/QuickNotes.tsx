import { FormEvent, useEffect, useRef, useState } from 'react';
import { Plus, StickyNote, Trash2 } from 'lucide-react';
import { Note } from '../../types';
import { formatRelativeTime } from '../../utils/taskQueries';

interface QuickNotesProps {
  notes: Note[];
  onAdd: (content: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  focusAdd?: boolean;
  onFocusAddHandled?: () => void;
}

export const QuickNotes = ({
  notes,
  onAdd,
  onDelete,
  focusAdd,
  onFocusAddHandled,
}: QuickNotesProps) => {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focusAdd) return;
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onFocusAddHandled?.();
  }, [focusAdd, onFocusAddHandled]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || saving) return;

    setSaving(true);
    setError('');
    try {
      await onAdd(content);
      setDraft('');
    } catch {
      setError('Failed to add note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-zinc-900" />
        <h3 className="text-sm font-semibold text-zinc-900">Quick Notes</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Jot something down..."
          maxLength={1000}
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {notes.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-zinc-800">No notes yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Quick reminders that don&apos;t need to be tasks.
          </p>
        </div>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {notes.map((note) => (
            <li
              key={note.noteId}
              className="flex items-start gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm text-zinc-800">
                  {note.content}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {formatRelativeTime(note.updatedAt || note.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onDelete(note.noteId)}
                className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-white hover:text-red-600"
                aria-label="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
