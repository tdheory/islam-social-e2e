import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await super.open('/');
  }

  async skipIntroIfVisible() {
    const skip = this.page.getByRole('button', { name: /skip/i });
    if (await skip.count() > 0) {
      try {
        await skip.first().click({ timeout: 3000 });
      } catch {}
    }
  }

  async openLogin() {
    await this.page.getByRole('link', { name: /Log\s?in|Login|Sign in/i }).first().click();
  }

  async login(email: string, password: string) {
    // В формах логина input типа password часто не виден по role='textbox', используем locator
    await this.page.locator('input[type="email"], input[name*="email"]').first().fill(email);
    await this.page.locator('input[type="password"], input[name*="password"]').first().fill(password);
    await this.page.getByRole('button', { name: /Sign in|Log in|Login/i }).first().click();
  }

  async expectLoggedIn() {
    await expect(this.page).not.toHaveURL(/login/i);
  }
}