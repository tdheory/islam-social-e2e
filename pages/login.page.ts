import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
  }

  async skipIntroIfVisible() {
    const skip = this.page.getByRole('button', { name: 'Skip' });

    if (await skip.isVisible()) {
      await skip.click();
    }
  }

  async openLogin() {
    await this.page.getByRole('link', { name: 'Log in' }).click();
  }

  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Login' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/login/i);
  }
}