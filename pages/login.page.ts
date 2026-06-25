import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.page.goto('/');
  }

  async skipIntroIfVisible() {
    const skip = this.page.getByRole('button', { name: 'Skip' });

    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }
  }

  async openLogin() {
    await this.page.getByRole('link', { name: /Log in/i }).click();
  }

  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: /Login/i }).fill(email);
    await this.page.getByRole('textbox', { name: /Password/i }).fill(password);
    await this.page.getByRole('button', { name: /Sign in/i }).click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/login/i);
  }
}