import { useRef, useState } from 'react';
import type { Task } from '../types';
import { PRIORITY_LABEL, PRIORITY_COLOR } from '../types';
import { updateTask, deleteTask } from '../api/tasks';

interface Props {
  task: Task;
  onUpdated: (updated: Task) => void;
  onDeleted: (id: string) => void;
  onTap: () => void;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_ZONE = 0.6; // 右40%からのタッチのみ横スワイプ有効

export default function TaskItem({ task, onUpdated, onDeleted, onTap }: Props) {
  const done = task.status === 'done';
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState(false);
  const touchStartX = useRef(0);
  const swipeActive = useRef(false);

  async function toggleDone() {
    const updated = await updateTask(task.id, {
      status: done ? 'todo' : 'done',
    });
    onUpdated(updated);
  }

  function handleDelete() {
    setExiting(true);
    setDragX(-500);
    setTimeout(async () => {
      await deleteTask(task.id);
      onDeleted(task.id);
    }, 250);
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.touches[0].clientX - rect.left;
    swipeActive.current = !exiting && relX / rect.width > SWIPE_ZONE;
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!swipeActive.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX < 0) setDragX(deltaX);
  }

  function onTouchEnd() {
    if (!swipeActive.current) return;
    swipeActive.current = false;
    if (-dragX >= SWIPE_THRESHOLD) handleDelete();
    else setDragX(0);
  }

  const deleteOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 削除背景 */}
      <div
        className="absolute inset-0 bg-rose-500 flex items-center justify-end pr-5 rounded-xl"
        style={{ opacity: deleteOpacity }}
      >
        <span className="text-white text-sm font-medium">削除</span>
      </div>

      {/* カード本体 */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative flex items-start gap-3 bg-white px-4 py-3 shadow-sm"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: exiting ? 'transform 0.25s ease-in' : dragX === 0 ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
      >
        <button
          onClick={toggleDone}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            done ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
          }`}
        >
          {done && <span className="text-white text-xs leading-none">✓</span>}
        </button>

        <button onClick={onTap} className="flex-1 text-left min-w-0">
          <p className={`text-slate-800 font-medium leading-snug ${done ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </p>
          {task.body && (
            <p className="text-slate-400 text-sm mt-0.5 truncate">{task.body}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {task.priority !== 4 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
                {PRIORITY_LABEL[task.priority]}
              </span>
            )}
            {task.due_date && (
              <span className="text-xs text-slate-400">{task.due_date}</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
