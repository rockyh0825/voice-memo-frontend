import type { Task, Status, Priority } from '../types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const TOKEN = import.meta.env.VITE_API_TOKEN ?? '';

function authHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchTasks(status?: Status): Promise<Task[]> {
  const url = status ? `${BASE}/tasks?status=${status}` : `${BASE}/tasks`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse<Task[]>(res);
}

export async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'source'>>): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

export async function fetchDoneTasksByMonth(year: number, month: number): Promise<Task[]> {
  const url = `${BASE}/tasks?status=done&year=${year}&month=${month}`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse<Task[]>(res);
}

export async function createTask(data: {
  title: string;
  body: string | null;
  priority: Priority;
  due_date: string | null;
}): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...data, status: 'todo' }),
  });
  return handleResponse<Task>(res);
}
