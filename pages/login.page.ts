import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await super.open('/');
  }

  async openLogin() {
    await this.page.getByRole('link', { name: 'Login' }).first().click();
  }

  async login(email: string, password: string) {
    // Используем точные имена полей из твоего codegen
    await this.page.getByRole('textbox', { name: 'Login' }).first().fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).first().fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).first().click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/login/i);
    const userDashboard = this.page.getByText(/dashboard|profile|feed|home|welcome/i).first();
    await expect(userDashboard).toBeVisible({ timeout: 15000 });
  }
}