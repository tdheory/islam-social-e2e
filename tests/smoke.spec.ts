import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  
  // Проверяем, что body отображается
  await expect(page.locator('body')).toBeVisible();
  
  // Опционально: проверить, что title не пустой
  const title = await page.title();
  expect(title.length).toBeGreaterThan(0);
});