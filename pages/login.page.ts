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
    await this.page.getByRole('textbox', { name: /login|email/i }).first().fill(email);
    await this.page.getByRole('textbox', { name: /password/i }).first().fill(password);
    await this.page.getByRole('button', { name: /sign in|login/i }).first().click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/login/i, { timeout: 10000 });
    const userDashboard = this.page.getByText(/dashboard|profile|feed|home|welcome/i).first();
    await expect(userDashboard).toBeVisible({ timeout: 15000 });
  }
}