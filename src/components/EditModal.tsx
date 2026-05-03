import { useState } from 'react';
import type { Task, Priority } from '../types';
import { PRIORITY_LABEL } from '../types';
import { updateTask, deleteTask } from '../api/tasks';

interface Props {
  task: Task;
  onClose: () => void;
  onSaved: (updated: Task) => void;
  onDeleted: (id: string) => void;
}

export default function EditModal({ task, onClose, onSaved, onDeleted }: Props) {
  const [title, setTitle] = useState(task.title);
  const [body, setBody] = useState(task.body ?? '');
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title: title.trim(),
        body: body.trim() || null,
        priority,
        due_date: dueDate || null,
      });
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('このタスクを削除しますか？')) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      onDeleted(task.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 pb-10 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">タスクを編集</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl leading-none p-1">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">タイトル</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">詳細</label>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 overflow-hidden">
              <label className="block text-sm font-medium text-slate-600 mb-1">優先度</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as Priority)}
              >
                {([1, 2, 3, 4] as Priority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0 overflow-hidden">
              <label className="block text-sm font-medium text-slate-600 mb-1">期日</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-rose-500 text-sm font-medium px-3 py-2 disabled:opacity-40"
          >
            {deleting ? '削除中...' : '削除'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 text-sm font-medium border border-slate-200"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium disabled:opacity-40"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
