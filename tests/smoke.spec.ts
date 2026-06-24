import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');

  await page.waitForLoadState();

  await expect(page).toHaveURL(/islam/);
});