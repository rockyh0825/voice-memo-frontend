import { useEffect, useState } from 'react';
import type { Task } from '../types';
import { fetchDoneTasksByMonth } from '../api/tasks';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../types';

function toLocalDateString(isoString: string): string {
  return new Date(isoString).toLocaleDateString('sv-SE'); // YYYY-MM-DD in local time
}

function countColor(count: number): string {
  if (count >= 5) return 'bg-indigo-600 text-white';
  if (count >= 3) return 'bg-indigo-400 text-white';
  if (count >= 1) return 'bg-indigo-200 text-indigo-800';
  return '';
}

export default function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setExpandedDate(null);
    fetchDoneTasksByMonth(year, month)
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, month]);

  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.completed_at) continue;
    const d = toLocalDateString(task.completed_at);
    const arr = tasksByDate.get(d) ?? [];
    arr.push(task);
    tasksByDate.set(d, arr);
  }

  const firstDayOfMonth = new Date(year, month - 1, 1);
  // 月曜始まり: 0=月 ... 6=日
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();

  // 週ごとに日付を並べる
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  function dateKey(day: number) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function toggleExpand(key: string) {
    setExpandedDate((prev) => (prev === key ? null : key));
  }

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const isCurrentOrFuture = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
    if (isCurrentOrFuture) return;
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="px-4 py-2">
      {/* 月ナビゲーション */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-200 active:bg-slate-300 text-lg"
        >
          ‹
        </button>
        <span className="text-base font-semibold text-slate-800">
          {year}年{month}月
        </span>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={`w-9 h-9 flex items-center justify-center rounded-full text-lg ${
            isCurrentMonth ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-200 active:bg-slate-300'
          }`}
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 5 ? 'text-sky-500' : i === 6 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center text-slate-400 mt-8">読み込み中...</p>
      )}
      {error && (
        <p className="text-center text-rose-500 mt-8">{error}</p>
      )}

      {!loading && !error && weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            if (day === null) {
              return <div key={di} className="h-12" />;
            }
            const key = dateKey(day);
            const count = (tasksByDate.get(key) ?? []).length;
            const isExpanded = expandedDate === key;
            const isToday =
              year === now.getFullYear() &&
              month === now.getMonth() + 1 &&
              day === now.getDate();
            const isSat = di === 5;
            const isSun = di === 6;

            return (
              <button
                key={di}
                onClick={() => count > 0 && toggleExpand(key)}
                className={`h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
                  count > 0 ? 'cursor-pointer active:bg-slate-100' : 'cursor-default'
                } ${isExpanded ? 'bg-indigo-50' : ''}`}
              >
                <span
                  className={`text-sm leading-none ${
                    isToday
                      ? 'w-6 h-6 flex items-center justify-center rounded-full bg-indigo-500 text-white font-bold'
                      : isSat
                      ? 'text-sky-500'
                      : isSun
                      ? 'text-rose-400'
                      : 'text-slate-700'
                  }`}
                >
                  {day}
                </span>
                {count > 0 && (
                  <span className={`text-[10px] leading-none px-1.5 py-0.5 rounded-full font-medium ${countColor(count)}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      {/* 選択日のタスク詳細 */}
      {!loading && !error && expandedDate && (() => {
        const expandedTasks = tasksByDate.get(expandedDate) ?? [];
        return (
          <div className="mt-4 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {month}月{parseInt(expandedDate.split('-')[2], 10)}日
              </span>
              <span className="text-xs text-slate-400">{expandedTasks.length}件完了</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {expandedTasks.map((task) => (
                <li key={task.id} className="px-4 py-3 flex items-start gap-2">
                  <span className={`mt-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${PRIORITY_COLOR[task.priority as 1 | 2 | 3 | 4]}`}>
                    {PRIORITY_LABEL[task.priority as 1 | 2 | 3 | 4]}
                  </span>
                  <span className="text-sm text-slate-700 leading-snug">{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {!loading && !error && tasks.length === 0 && (
        <div className="text-center text-slate-400 mt-12">
          <p className="text-4xl mb-3">📅</p>
          <p>この月に完了したタスクはありません</p>
        </div>
      )}
    </div>
  );
}
