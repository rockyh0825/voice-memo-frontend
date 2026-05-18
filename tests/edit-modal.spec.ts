import { test, expect } from '@playwright/test';
import { mockApi } from './helpers/api';

test.describe('EditModal - 期日フィールド', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/tasks');
  });

  test('日付が設定されているタスクを開くと×ボタンが表示される', async ({ page }) => {
    await page.getByText('テストタスクA').click();

    const clearButton = page.locator('div:has(> input[type="date"]) button[type="button"]');
    await expect(clearButton).toBeVisible();
  });

  test('×ボタンで日付をクリアできる', async ({ page }) => {
    await page.getByText('テストタスクA').click();

    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toHaveValue('2026-06-01');

    const clearButton = page.locator('div:has(> input[type="date"]) button[type="button"]');
    await clearButton.click();
    await expect(dateInput).toHaveValue('');
  });

  test('日付が未設定のタスクは×ボタンが表示されない', async ({ page }) => {
    await page.getByText('テストタスクB').click();

    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toHaveValue('');

    const clearButton = page.locator('div:has(> input[type="date"]) button[type="button"]');
    await expect(clearButton).toHaveCount(0);
  });
});
