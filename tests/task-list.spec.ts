import { test, expect } from '@playwright/test';
import { mockApi, DONE_TASKS } from './helpers/api';

test.describe('TaskListPage', () => {
  test('todoタスクが一覧表示される', async ({ page }) => {
    await mockApi(page);
    await page.goto('/tasks');

    await expect(page.getByText('テストタスクA')).toBeVisible();
    await expect(page.getByText('テストタスクB')).toBeVisible();
  });

  test('完了タブが空のとき「直近で完了したタスクはありません」と表示される', async ({ page }) => {
    await mockApi(page);
    await page.goto('/tasks');

    await page.getByRole('button', { name: /^完了/ }).click();
    await expect(page.getByText('直近で完了したタスクはありません')).toBeVisible();
  });

  test('完了タブに完了済みタスクが表示される', async ({ page }) => {
    await mockApi(page, { doneTasks: DONE_TASKS });
    await page.goto('/tasks');

    await page.getByRole('button', { name: /^完了/ }).click();
    await expect(page.getByText('完了タスクC')).toBeVisible();
  });
});
