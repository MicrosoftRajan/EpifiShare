import { getToken, clearToken } from './auth';
import type { LoginResponse, Note, RegisterResponse, UserProfile } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new ApiError(res.status, data.message || 'Request failed');
  }

  return data as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ message: string }>('/logout', { method: 'POST' }),

  getMe: () => request<UserProfile>('/me'),

  getNotes: () => request<Note[]>('/notes'),

  getNote: (id: string) => request<Note>(`/notes/${id}`),

  createNote: (title: string, content: string) =>
    request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  updateNote: (id: string, title: string, content: string) =>
    request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    }),

  deleteNote: (id: string) =>
    request<void>(`/notes/${id}`, { method: 'DELETE' }),

  shareNote: (id: string, share_with_email: string) =>
    request<{ message: string }>(`/notes/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ share_with_email }),
    }),

  pinNote: (id: string, pinned: boolean) =>
    request<Note & { is_pinned: boolean }>(`/notes/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pinned }),
    }),

  setReminder: (id: string, reminder_at: string | null) =>
    request<Note>(`/notes/${id}/reminder`, {
      method: 'PATCH',
      body: JSON.stringify({ reminder_at }),
    }),
};
