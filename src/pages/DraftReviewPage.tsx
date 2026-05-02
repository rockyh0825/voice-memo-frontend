import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { fetchTasks, updateTask, deleteTask } from '../api/tasks';
import DraftCard from '../components/DraftCard';
import EditModal from '../components/EditModal';

export default function DraftReviewPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks('draft')
      .then((tasks) => {
        if (tasks.length === 0) navigate('/tasks', { replace: true });
        else setDrafts(tasks);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const current = drafts[0];
  const total = drafts.length;

  async function handleApprove() {
    if (!current) return;
    await updateTask(current.id, { status: 'todo' });
    advance();
  }

  async function handleDelete() {
    if (!current) return;
    await deleteTask(current.id);
    advance();
  }

  function advance() {
    setDrafts((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) navigate('/tasks', { replace: true });
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-400">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-6">
        <p className="text-rose-500 text-center">{error}</p>
        <button
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm"
        >
          タスク一覧へ
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">ドラフト確認</h1>
        <p className="text-slate-400 text-sm mt-1">
          音声メモから抽出されたタスクを確認してください
        </p>
      </header>

      <div className="flex-1 px-6 pt-2 pb-10">
        <DraftCard
          key={current.id}
          task={current}
          remaining={total}
          total={total}
          onApprove={handleApprove}
          onDelete={handleDelete}
          onEdit={() => setEditingTask(current)}
        />
      </div>

      <footer className="px-6 pb-8 text-center">
        <button
          onClick={() => navigate('/tasks')}
          className="text-slate-400 text-sm underline"
        >
          後で確認する
        </button>
      </footer>

      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={(updated) => {
            setDrafts((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingTask(null);
          }}
          onDeleted={(id) => {
            setEditingTask(null);
            setDrafts((prev) => {
              const next = prev.filter((t) => t.id !== id);
              if (next.length === 0) navigate('/tasks', { replace: true });
              return next;
            });
          }}
        />
      )}
    </div>
  );
}
