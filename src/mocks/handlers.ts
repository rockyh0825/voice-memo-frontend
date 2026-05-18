import { http, HttpResponse } from 'msw';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// 今月・先月・先々月にまたがるモックデータ
function makeDate(daysAgo: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

let idSeq = 100;
function uid() { return `mock-${idSeq++}`; }

const DONE_TASKS = [
  { id: uid(), title: 'デザインレビューの準備', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(0, 9) },
  { id: uid(), title: 'バグ修正 #123', body: 'ログイン画面のバリデーション', priority: 1, due_date: null, status: 'done', source: 'voice', completed_at: makeDate(0, 14) },
  { id: uid(), title: 'ミーティング議事録', body: null, priority: 3, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(1, 11) },
  { id: uid(), title: 'ユニットテスト追加', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(1, 16) },
  { id: uid(), title: 'PRレビュー対応', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(3, 10) },
  { id: uid(), title: 'ドキュメント更新', body: null, priority: 3, due_date: null, status: 'done', source: 'voice', completed_at: makeDate(3, 15) },
  { id: uid(), title: 'CI設定の修正', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(5, 9) },
  { id: uid(), title: '依存パッケージ更新', body: null, priority: 4, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(5, 13) },
  { id: uid(), title: 'コードレビュー', body: null, priority: 3, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(7, 10) },
  { id: uid(), title: 'スプリント振り返り', body: null, priority: 3, due_date: null, status: 'done', source: 'voice', completed_at: makeDate(7, 17) },
  { id: uid(), title: 'APIドキュメント作成', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(10, 11) },
  { id: uid(), title: 'リリースノート執筆', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(12, 9) },
  { id: uid(), title: 'セキュリティレビュー', body: null, priority: 1, due_date: null, status: 'done', source: 'voice', completed_at: makeDate(14, 10) },
  { id: uid(), title: 'パフォーマンス計測', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(14, 14) },
  { id: uid(), title: 'ステージング確認', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(14, 16) },
  { id: uid(), title: 'バックログ整理', body: null, priority: 3, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(20, 10) },
  { id: uid(), title: 'インフラコスト確認', body: null, priority: 3, due_date: null, status: 'done', source: 'voice', completed_at: makeDate(25, 9) },
  { id: uid(), title: '新メンバーオンボーディング', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(32, 10) },
  { id: uid(), title: 'デプロイ手順の整備', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(35, 14) },
  { id: uid(), title: 'モニタリング設定', body: null, priority: 2, due_date: null, status: 'done', source: 'voice', completed_at: makeDate(40, 11) },
  { id: uid(), title: 'ログ調査', body: null, priority: 1, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(45, 9) },
  { id: uid(), title: 'データ移行スクリプト', body: null, priority: 2, due_date: null, status: 'done', source: 'manual', completed_at: makeDate(50, 10) },
];

const TODO_TASKS = [
  { id: uid(), title: '次スプリント計画', body: null, priority: 2, due_date: null, status: 'todo', source: 'manual', completed_at: null },
  { id: uid(), title: 'E2Eテスト追加', body: 'カレンダービューのテスト', priority: 3, due_date: null, status: 'todo', source: 'voice', completed_at: null },
  { id: uid(), title: 'TypeScript 厳密化', body: null, priority: 4, due_date: null, status: 'todo', source: 'manual', completed_at: null },
];

export const handlers = [
  http.get(`${BASE}/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    if (status === 'done') {
      const yearParam = url.searchParams.get('year');
      const monthParam = url.searchParams.get('month');
      if (yearParam && monthParam) {
        const y = parseInt(yearParam, 10);
        const m = parseInt(monthParam, 10);
        const start = new Date(y, m - 1, 1, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59);
        return HttpResponse.json(
          DONE_TASKS.filter((t) => {
            const d = new Date(t.completed_at!);
            return d >= start && d <= end;
          })
        );
      }
      // 直近12時間
      const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000);
      return HttpResponse.json(DONE_TASKS.filter((t) => new Date(t.completed_at!) >= cutoff));
    }

    if (status === 'todo') return HttpResponse.json(TODO_TASKS);

    return HttpResponse.json([...TODO_TASKS, ...DONE_TASKS]);
  }),

  http.post(`${BASE}/tasks`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const task = { id: uid(), source: 'manual', completed_at: null, priority: 3, ...body };
    TODO_TASKS.push(task as typeof TODO_TASKS[0]);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch(`${BASE}/tasks/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const all = [...TODO_TASKS, ...DONE_TASKS];
    const task = all.find((t) => t.id === params.id);
    if (!task) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    if (body.status === 'done') body.completed_at = new Date().toISOString();
    else if (body.status === 'todo') body.completed_at = null;
    Object.assign(task, body);
    return HttpResponse.json(task);
  }),

  http.delete(`${BASE}/tasks/:id`, ({ params }) => {
    const idx = TODO_TASKS.findIndex((t) => t.id === params.id);
    if (idx !== -1) TODO_TASKS.splice(idx, 1);
    const idx2 = DONE_TASKS.findIndex((t) => t.id === params.id);
    if (idx2 !== -1) DONE_TASKS.splice(idx2, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
