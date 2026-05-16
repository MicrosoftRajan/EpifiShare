'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { isLoggedIn } from '@/lib/auth';
import type { Note } from '@/lib/types';
import { LoaderOne } from '@/components/ui/loader';
import {
  defaultReminderValue,
  formatReminder,
  fromDatetimeLocalValue,
  isReminderOverdue,
  toDatetimeLocalValue,
} from '@/lib/reminder';

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [reminderValue, setReminderValue] = useState(defaultReminderValue());

  const loadNotes = useCallback(async () => {
    setError('');
    try {
      const data = await api.getNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load notes');
      if (err instanceof ApiError && err.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }
    loadNotes();
  }, [loadNotes, router]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api.createNote(title, content);
      setTitle('');
      setContent('');
      await loadNotes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create note');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    try {
      await api.deleteNote(id);
      await loadNotes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete');
    }
  }

  async function handlePin(note: Note) {
    try {
      await api.pinNote(note.id, !note.is_pinned);
      await loadNotes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to pin');
    }
  }

  function openReminder(note: Note) {
    setRemindingId(remindingId === note.id ? null : note.id);
    setReminderValue(
      note.reminder_at ? toDatetimeLocalValue(note.reminder_at) : defaultReminderValue()
    );
  }

  async function handleSetReminder(id: string) {
    if (!reminderValue) return;
    try {
      await api.setReminder(id, fromDatetimeLocalValue(reminderValue));
      setRemindingId(null);
      await loadNotes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to set reminder');
    }
  }

  async function handleClearReminder(id: string) {
    try {
      await api.setReminder(id, null);
      setRemindingId(null);
      await loadNotes();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to clear reminder');
    }
  }

  async function handleShare(id: string) {
    if (!shareEmail.trim()) return;
    try {
      await api.shareNote(id, shareEmail.trim());
      setSharingId(null);
      setShareEmail('');
      alert('Note shared successfully');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to share');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-brand text-4xl">Epifi Share</h1>
      <p className="mt-1 text-sm text-zinc-500">My notes</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        onSubmit={handleCreate}
        className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="font-semibold">New note</h2>
        <input
          placeholder="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <textarea
          placeholder="Content"
          required
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          Create note
        </button>
      </form>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <LoaderOne />
          <p className="text-sm text-zinc-500">Loading notes…</p>
        </div>
      ) : notes.length === 0 ? (
        <p className="mt-8 text-zinc-500">No notes yet. Create one above.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {notes.map((note) => (
            <li
              key={note.id}
              className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
                note.is_pinned
                  ? 'border-red-300 ring-1 ring-red-200 dark:border-red-900 dark:ring-red-950'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{note.title}</h3>
                {note.is_pinned && (
                  <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                    Pin
                  </span>
                )}
                {note.reminder_at && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white ${
                      isReminderOverdue(note.reminder_at) ? 'bg-orange-600' : 'bg-blue-600'
                    }`}
                  >
                    {isReminderOverdue(note.reminder_at) ? 'Due' : 'Reminder'}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                {note.content}
              </p>
              {note.reminder_at && (
                <p
                  className={`mt-2 text-xs font-medium ${
                    isReminderOverdue(note.reminder_at) ? 'text-orange-600' : 'text-blue-600'
                  }`}
                >
                  Reminder: {formatReminder(note.reminder_at)}
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-400">
                Updated {new Date(note.updated_at).toLocaleString()}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePin(note)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    note.is_pinned
                      ? 'border border-red-600 bg-red-600 text-white hover:bg-red-700'
                      : 'border border-zinc-300 text-zinc-700 hover:border-red-400 hover:text-red-600 dark:border-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {note.is_pinned ? 'Unpin' : 'Pin Badge'}
                </button>
                <button
                  type="button"
                  onClick={() => openReminder(note)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                    note.reminder_at
                      ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                      : 'border-zinc-300 text-zinc-700 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {note.reminder_at ? 'Edit reminder' : 'Reminder'}
                </button>
                <button
                  type="button"
                  onClick={() => setSharingId(sharingId === note.id ? null : note.id)}
                  className="rounded-lg border border-zinc-300 px-3 py-1 text-xs dark:border-zinc-600"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 dark:border-red-900"
                >
                  Delete
                </button>
              </div>
              {remindingId === note.id && (
                <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <label className="block text-xs font-medium text-blue-800 dark:text-blue-200">
                    Remind me at
                  </label>
                  <input
                    type="datetime-local"
                    value={reminderValue}
                    onChange={(e) => setReminderValue(e.target.value)}
                    className="w-full rounded-lg border border-blue-300 px-2 py-1 text-sm dark:border-blue-800 dark:bg-zinc-950"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetReminder(note.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Save reminder
                    </button>
                    {note.reminder_at && (
                      <button
                        type="button"
                        onClick={() => handleClearReminder(note.id)}
                        className="rounded-lg border border-blue-300 px-3 py-1 text-sm text-blue-700 dark:border-blue-700 dark:text-blue-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
              {sharingId === note.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="email"
                    placeholder="friend@test.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleShare(note.id)}
                    className="rounded-lg bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-zinc-900"
                  >
                    Send
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
