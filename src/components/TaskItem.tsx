import type { Task } from '../types';
import { PRIORITY_LABEL, PRIORITY_COLOR } from '../types';
import { updateTask } from '../api/tasks';

interface Props {
  task: Task;
  onUpdated: (updated: Task) => void;
  onTap: () => void;
}

export default function TaskItem({ task, onUpdated, onTap }: Props) {
  const done = task.status === 'done';

  async function toggleDone() {
    const updated = await updateTask(task.id, {
      status: done ? 'todo' : 'done',
    });
    onUpdated(updated);
  }

  return (
    <div className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
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
  );
}
