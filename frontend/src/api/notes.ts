import { Note } from '../types';
import { apiRequest } from './client';

export function getNotes() {
  return apiRequest<Note[]>('/api/Notes', { method: 'GET', auth: true });
}

export function createNote(content: string) {
  return apiRequest<{ id: string; message: string }>('/api/Notes', {
    method: 'POST',
    auth: true,
    body: { content },
  });
}

export function updateNote(noteId: string, content: string) {
  return apiRequest<{ message: string }>(`/api/Notes/${noteId}`, {
    method: 'PUT',
    auth: true,
    body: { noteId, content },
  });
}

export function deleteNote(noteId: string) {
  return apiRequest<{ message: string }>(`/api/Notes/${noteId}`, {
    method: 'DELETE',
    auth: true,
  });
}
