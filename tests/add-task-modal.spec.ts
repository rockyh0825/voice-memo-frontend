import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/api';

test.describe('AddTaskModal - 期日フィールド', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/tasks');
    await page.getByRole('button', { name: '＋' }).click();
  });

  test('日付を入力すると×ボタンが表示される', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-06-15');

    const clearButton = page.locator('div:has(> input[type="date"]) button[type="button"]');
    await expect(clearButton).toBeVisible();
  });

  test('×ボタンで日付をクリアできる', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await dateInput.fill('2026-06-15');
    await expect(dateInput).toHaveValue('2026-06-15');

    const clearButton = page.locator('div:has(> input[type="date"]) button[type="button"]');
    await clearButton.click();
    await expect(dateInput).toHaveValue('');
    await expect(clearButton).toHaveCount(0);
  });
});
