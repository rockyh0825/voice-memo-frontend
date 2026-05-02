import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../types';
import { fetchTasks } from '../api/tasks';
import TaskItem from '../components/TaskItem';
import EditModal from '../components/EditModal';

type Tab = 'todo' | 'done';

export default function TaskListPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('todo');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then((all) => setTasks(all.filter((t) => t.status !== 'draft')))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks
    .filter((t) => t.status === tab)
    .sort((a, b) => a.priority - b.priority);

  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <header className="px-6 pt-12 pb-4 bg-slate-50 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800">タスク</h1>

        <div className="flex gap-1 mt-4 bg-slate-200 rounded-xl p-1">
          {(['todo', 'done'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t === 'todo' ? `未完了 ${todoCount}` : `完了 ${doneCount}`}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-2">
        {loading && (
          <p className="text-center text-slate-400 mt-12">読み込み中...</p>
        )}
        {error && (
          <p className="text-center text-rose-500 mt-12">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center text-slate-400 mt-16">
            <p className="text-4xl mb-3">{tab === 'todo' ? '🎉' : '📋'}</p>
            <p>{tab === 'todo' ? 'タスクはありません' : 'まだ完了したタスクはありません'}</p>
          </div>
        )}
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdated={(updated) =>
                setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
              }
              onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
              onTap={() => setEditingTask(task)}
            />
          ))}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/voice')}
        className="fixed bottom-8 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
      >
        🎤
      </button>

      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingTask(null);
          }}
          onDeleted={(id) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
