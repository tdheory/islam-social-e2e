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
  }

  async register(name: string, email: string, password: string) {
    console.log('WAIT: registration form');

    const nameInput = this.page.getByRole('textbox', {
      name: 'Enter your name',
    });

    await expect(nameInput).toBeVisible({ timeout: 15000 });

    await nameInput.fill(name);

    await this.page.getByRole('textbox', { name: 'Enter your email' }).fill(email);

    await this.page.getByRole('textbox', { name: 'Enter your password' }).fill(password);

    await this.page.getByRole('textbox', { name: 'Confirm password' }).fill(password);

    await this.page.getByRole('checkbox', {
      name: 'I accept User agreement',
    }).check();

    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  // 🔥 НОВОЕ: ввод OTP
  async enterOtp(code: string) {
    console.log('STEP OTP: entering code');

    const otpInput = this.page.getByRole('textbox', {
      name: /confirmation code|code/i,
    });

    await expect(otpInput).toBeVisible({ timeout: 15000 });

    await otpInput.fill(code);

    await this.page.getByRole('button', {
      name: /next|confirm|verify/i,
    }).click();
  }

  async expectRegistered() {
    await expect(this.page).not.toHaveURL(/register|signup|verify/i);
  }
}