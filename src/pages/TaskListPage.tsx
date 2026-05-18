import { useEffect, useRef, useState } from 'react';
import type { Task } from '../types';
import { fetchTasks } from '../api/tasks';
import TaskItem from '../components/TaskItem';
import EditModal from '../components/EditModal';
import AddTaskModal from '../components/AddTaskModal';

type Tab = 'todo' | 'done';

export default function TaskListPage() {
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [doneLoading, setDoneLoading] = useState(false);
  const doneLoaded = useRef(false);
  const [tab, setTab] = useState<Tab>('todo');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks('todo')
      .then(setTodoTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'done' || doneLoaded.current) return;
    doneLoaded.current = true;
    setDoneLoading(true);
    fetchTasks('done')
      .then(setDoneTasks)
      .catch((e) => setError(e.message))
      .finally(() => setDoneLoading(false));
  }, [tab]);

  const filtered = (tab === 'todo' ? todoTasks : doneTasks)
    .sort((a, b) => a.priority - b.priority);

  const todoCount = todoTasks.length;
  const doneCount = doneLoaded.current ? doneTasks.length : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-32">
      <header className="px-6 pt-12 pb-4 bg-slate-50 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800">タスク</h1>
      </header>

      <main className="flex-1 px-4 py-2">
        {(loading || doneLoading) && (
          <p className="text-center text-slate-400 mt-12">読み込み中...</p>
        )}
        {error && (
          <p className="text-center text-rose-500 mt-12">{error}</p>
        )}
        {!loading && !doneLoading && !error && filtered.length === 0 && (
          <div className="text-center text-slate-400 mt-16">
            <p className="text-4xl mb-3">{tab === 'todo' ? '🎉' : '📋'}</p>
            <p>{tab === 'todo' ? 'タスクはありません' : '直近で完了したタスクはありません'}</p>
          </div>
        )}
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdated={(updated) => {
                if (updated.status === 'todo') {
                  setTodoTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t).filter((t) => t.status === 'todo'));
                  setDoneTasks((prev) => prev.filter((t) => t.id !== updated.id));
                } else {
                  setDoneTasks((prev) => {
                    const exists = prev.some((t) => t.id === updated.id);
                    return exists ? prev.map((t) => t.id === updated.id ? updated : t) : [...prev, updated];
                  });
                  setTodoTasks((prev) => prev.filter((t) => t.id !== updated.id));
                }
              }}
              onDeleted={(id) => {
                setTodoTasks((prev) => prev.filter((t) => t.id !== id));
                setDoneTasks((prev) => prev.filter((t) => t.id !== id));
              }}
              onTap={() => setEditingTask(task)}
            />
          ))}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
      >
        ＋
      </button>

      {/* タブ切り替え（下固定バー） */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-8 bg-slate-50 border-t border-slate-200">
        <div className="flex gap-1 bg-slate-200 rounded-xl p-1">
          {(['todo', 'done'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t === 'todo' ? `未完了 ${todoCount}` : `完了 ${doneCount ?? '?'}`}
            </button>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdded={(task) => {
            setTodoTasks((prev) => [...prev, task]);
            setShowAddModal(false);
          }}
        />
      )}

      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={(updated) => {
            if (updated.status === 'todo') {
              setTodoTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t).filter((t) => t.status === 'todo'));
              setDoneTasks((prev) => prev.filter((t) => t.id !== updated.id));
            } else {
              setDoneTasks((prev) => {
                const exists = prev.some((t) => t.id === updated.id);
                return exists ? prev.map((t) => t.id === updated.id ? updated : t) : [...prev, updated];
              });
              setTodoTasks((prev) => prev.filter((t) => t.id !== updated.id));
            }
            setEditingTask(null);
          }}
          onDeleted={(id) => {
            setTodoTasks((prev) => prev.filter((t) => t.id !== id));
            setDoneTasks((prev) => prev.filter((t) => t.id !== id));
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
