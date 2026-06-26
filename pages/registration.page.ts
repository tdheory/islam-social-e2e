import { expect, Page } from '@playwright/test';

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async skipIntroIfVisible() {
    const skip = this.page.getByRole('button', { name: /skip/i });
    if (await skip.count() > 0) {
      try {
        await skip.first().click({ timeout: 3000 });
      } catch {
        // Игнорируем, если кнопка пропала
      }
    }
  }

  async openRegistration() {
    const registerBtn = this.page.getByRole('link', { name: /sign up|register|create account/i });
    await expect(registerBtn.first()).toBeVisible({ timeout: 10000 });
    await registerBtn.first().click();
  }

  async register(name: string, email: string, password: string) {
    const nameInput = this.page.getByRole('textbox', { name: /name/i });
    await expect(nameInput.first()).toBeVisible({ timeout: 15000 });

    await nameInput.first().fill(name);
    await this.page.getByRole('textbox', { name: /email/i }).first().fill(email);
    
    // Заполнение пароля (используем testid или label для надежности, если name не срабатывает)
    const passwordInputs = this.page.getByRole('textbox', { name: /password/i });
    await passwordInputs.nth(0).fill(password);
    
    // Если есть поле Confirm password
    if (await passwordInputs.nth(1).isVisible()) {
        await passwordInputs.nth(1).fill(password);
    }

    const agreementCheckbox = this.page.getByRole('checkbox', { name: /agreement|terms/i });
    if (await agreementCheckbox.isVisible()) {
        await agreementCheckbox.check();
    }

    await this.page.getByRole('button', { name: /next|continue/i }).first().click();
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