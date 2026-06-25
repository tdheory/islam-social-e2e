import { expect, Page } from '@playwright/test';

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('https://islam.social/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async skipIntroIfVisible() {
    const skip = this.page.getByRole('button', { name: /skip/i });

    if (await skip.count() > 0) {
      try {
        await skip.first().click({ timeout: 3000 });
      } catch {
        // ignore
      }
    }
  }

  async openRegistration() {
    console.log('CLICK: open registration');

    const registerBtn = this.page.getByRole('link', {
      name: /sign up|register|create account/i,
    });

    await expect(registerBtn.first()).toBeVisible({ timeout: 10000 });
    await registerBtn.first().click();

    // ждём появления формы регистрации
    await this.page.waitForTimeout(2000);
  }

  async register(name: string, email: string, password: string) {
    console.log('WAIT: registration form');

    const nameInput = this.page.getByRole('textbox', {
      name: 'Enter your name',
    });

    await expect(nameInput).toBeVisible({ timeout: 15000 });

    console.log('FILL: name');
    await nameInput.fill(name);

    console.log('FILL: email');
    await this.page.getByRole('textbox', { name: 'Enter your email' }).fill(email);

    console.log('FILL: password');
    await this.page.getByRole('textbox', { name: 'Enter your password' }).fill(password);

    console.log('FILL: confirm password');
    await this.page.getByRole('textbox', { name: 'Confirm password' }).fill(password);

    console.log('CHECK: user agreement');
    await this.page.getByRole('checkbox', {
      name: 'I accept User agreement',
    }).check();

    console.log('CLICK: next');
    await this.page.getByRole('button', { name: 'Next' }).click();

    // ждём переход после регистрации шага 1
    await this.page.waitForTimeout(3000);
  }

  async expectRegistered() {
    await expect(this.page).not.toHaveURL(/register|signup/i);
  }
}