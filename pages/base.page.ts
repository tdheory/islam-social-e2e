import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async open(path: string) {
    await this.page.goto(path);
  }
}