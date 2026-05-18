import type { Page } from '@playwright/test';
import type { Task } from '../../src/types';

export const TODO_TASKS: Task[] = [
  { id: '1', title: 'テストタスクA', body: null, priority: 2, due_date: '2026-06-01', status: 'todo', source: 'test' },
  { id: '2', title: 'テストタスクB', body: '詳細テキスト', priority: 3, due_date: null, status: 'todo', source: 'test' },
];

export const DONE_TASKS: Task[] = [
  { id: '3', title: '完了タスクC', body: null, priority: 4, due_date: null, status: 'done', source: 'test' },
];

export async function mockApi(page: Page, options: { doneTasks?: Task[] } = {}) {
  const doneTasks = options.doneTasks ?? [];

  await page.route('**/tasks?status=todo', (route) =>
    route.fulfill({ json: TODO_TASKS })
  );
  await page.route('**/tasks?status=done', (route) =>
    route.fulfill({ json: doneTasks })
  );
  await page.route('**/tasks?status=draft', (route) =>
    route.fulfill({ json: [] })
  );

  await page.route('**/tasks', async (route) => {
    if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() ?? '{}');
      route.fulfill({ json: { id: '99', source: 'test', ...body } });
    } else {
      route.continue();
    }
  });

  await page.route('**/tasks/*', async (route) => {
    const method = route.request().method();
    if (method === 'PATCH') {
      const body = JSON.parse(route.request().postData() ?? '{}');
      const id = route.request().url().split('/').at(-1)!;
      const base = TODO_TASKS.find((t) => t.id === id) ?? DONE_TASKS.find((t) => t.id === id)!;
      route.fulfill({ json: { ...base, ...body } });
    } else if (method === 'DELETE') {
      route.fulfill({ status: 204, body: '' });
    } else {
      route.continue();
    }
  });
}
