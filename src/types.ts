export type Priority = 1 | 2 | 3 | 4;
export type Status = 'draft' | 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  body: string | null;
  priority: Priority;
  due_date: string | null;
  status: Status;
  source: string;
  completed_at?: string | null;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  1: '緊急',
  2: '高',
  3: '中',
  4: 'なし',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  1: 'bg-rose-100 text-rose-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-slate-100 text-slate-500',
};
