import { useState } from 'react';
import type { Priority, Task } from '../types';
import { PRIORITY_LABEL } from '../types';
import { createTask } from '../api/tasks';

interface Props {
  onClose: () => void;
  onAdded: (task: Task) => void;
}

export default function AddTaskModal({ onClose, onAdded }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>(3);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const task = await createTask({
        title: title.trim(),
        body: body.trim() || null,
        priority,
        due_date: dueDate || null,
      });
      onAdded(task);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 pb-10 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-800">タスクを追加</h2>
          <button onClick={onClose} className="text-slate-400 text-2xl leading-none p-1">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">タイトル</label>
            <input
              autoFocus
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="タスク名を入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
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

          <div className="flex gap-3">
            <div className="flex-1">
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">期日</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-6">
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
            {saving ? '追加中...' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}
