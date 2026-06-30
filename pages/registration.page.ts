import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class RegistrationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await super.open('/');
  }

  async openRegistration() {
    const registerBtn = this.page.getByRole('link', { name: /register|sign up/i }).first();
    await expect(registerBtn).toBeVisible({ timeout: 10000 });
    await registerBtn.click();
  }

  async register(name: string, email: string, password: string) {
    await this.page.getByRole('textbox', { name: /enter your name/i }).first().fill(name);
    await this.page.getByRole('textbox', { name: /enter your email/i }).first().fill(email);
    await this.page.getByRole('textbox', { name: /enter your password/i }).first().fill(password);
    await this.page.getByRole('textbox', { name: /confirm password/i }).first().fill(password);

    const agreementCheckbox = this.page.getByRole('checkbox', { name: /accept user agreement|agreement/i }).first();
    if (await agreementCheckbox.isVisible()) {
        await agreementCheckbox.check();
    }

    await this.page.getByRole('button', { name: /next/i }).first().click();
  }

  async enterOtp(code: string) {
    const otpInput = this.page.getByRole('textbox', { name: /confirmation code|code|otp/i }).first();
    await expect(otpInput).toBeVisible({ timeout: 15000 });
    await otpInput.fill(code);
    await this.page.getByRole('button', { name: /next|confirm|verify/i }).first().click();
  }

  async expectRegistered() {
    await expect(this.page).not.toHaveURL(/register|signup|verify/i);
  }
}