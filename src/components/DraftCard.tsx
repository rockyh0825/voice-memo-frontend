import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Task } from '../types';
import { PRIORITY_LABEL, PRIORITY_COLOR } from '../types';

interface Props {
  task: Task;
  remaining: number;
  total: number;
  onApprove: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const SWIPE_THRESHOLD = 80;

export default function DraftCard({ task, remaining, total, onApprove, onDelete, onEdit }: Props) {
  const [dragX, setDragX] = useState(0);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);

  function exit(dir: 'left' | 'right', callback: () => void) {
    setExiting(dir);
    setDragX(dir === 'right' ? 500 : -500);
    setTimeout(callback, 280);
  }

  const handlers = useSwipeable({
    onSwiping: ({ deltaX }) => {
      if (!exiting) setDragX(deltaX);
    },
    onSwipedRight: ({ absX }) => {
      if (absX >= SWIPE_THRESHOLD) exit('right', onApprove);
      else setDragX(0);
    },
    onSwipedLeft: ({ absX }) => {
      if (absX >= SWIPE_THRESHOLD) exit('left', onDelete);
      else setDragX(0);
    },
    onTouchEndOrOnMouseUp: () => {
      if (!exiting && Math.abs(dragX) < SWIPE_THRESHOLD) setDragX(0);
    },
    trackMouse: true,
    delta: 5,
    preventScrollOnSwipe: true,
  });

  const approveOpacity = Math.min(Math.max(dragX / SWIPE_THRESHOLD, 0), 1);
  const deleteOpacity = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  return (
    <div className="relative select-none">
      {/* Background hints */}
      <div
        className="absolute inset-0 rounded-2xl bg-emerald-400 flex items-center pl-6"
        style={{ opacity: approveOpacity }}
      >
        <span className="text-white text-2xl font-bold">✓ 承認</span>
      </div>
      <div
        className="absolute inset-0 rounded-2xl bg-rose-400 flex items-center justify-end pr-6"
        style={{ opacity: deleteOpacity }}
      >
        <span className="text-white text-2xl font-bold">削除 ✕</span>
      </div>

      {/* Card */}
      <div
        {...handlers}
        className="relative bg-white rounded-2xl shadow-lg p-6 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX * 0.03}deg)`,
          transition: exiting ? 'transform 0.28s ease-in' : dragX === 0 ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <button
            onClick={onEdit}
            className="text-slate-400 text-sm px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            編集
          </button>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 mb-2 leading-snug">{task.title}</h3>

        {task.body && (
          <p className="text-slate-500 text-sm mb-3 leading-relaxed">{task.body}</p>
        )}

        {task.due_date && (
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <span>📅</span>
            <span>{task.due_date}</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>{remaining} / {total} 件</span>
          <span>← 削除　承認 →</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => exit('left', onDelete)}
          className="flex-1 py-3 rounded-xl border-2 border-rose-200 text-rose-500 font-medium text-sm"
        >
          削除
        </button>
        <button
          onClick={() => exit('right', onApprove)}
          className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium text-sm"
        >
          タスクに追加
        </button>
      </div>
    </div>
  );
}
