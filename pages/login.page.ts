import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openLogin() {
    await this.page.getByRole('link', { name: /login|sign in/i }).first().click();
  }

  async login(email: string, password: string) {
    console.log(`[>>] Авторизация пользователя: ${email}`);
    await this.page.getByRole('textbox', { name: /login|email/i }).first().fill(email);
    await this.page.getByRole('textbox', { name: /password/i }).first().fill(password);
    await this.page.getByRole('button', { name: /sign in|login/i }).first().click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/login|sign-in/i, { timeout: 15000 });

    const userElement = this.page.locator(
      'header img, [data-testid*="user"], [class*="avatar"], button:has-text("Logout"), a[href*="profile"]'
    ).first();

    await expect(userElement).toBeAttached({ timeout: 15000 });
    console.log('[✓] Авторизация прошла успешно');
  }
}