import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState('domcontentloaded');

  await expect(page.locator('body')).toBeVisible();
});