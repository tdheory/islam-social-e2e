import { Locator, Page } from '@playwright/test';

export class RegistrationPage {
  constructor(private page: Page) {}

  get nameInput(): Locator {
    return this.page.getByPlaceholder('Name');
  }

  get emailInput(): Locator {
    return this.page.getByPlaceholder('Email');
  }

  get passwordInput(): Locator {
    return this.page.getByPlaceholder('Password');
  }

  get submitButton(): Locator {
    return this.page.getByRole('button', { name: /sign up|register/i });
  }

  async open() {
    await this.page.goto('https://islam.social');
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}