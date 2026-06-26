// base.page.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  /** Открыть указанный путь (включая baseURL из конфигурации) */
  async open(path: string = '/') {
    await this.page.goto(path);
    // Ждем полной загрузки DOM
    await this.page.waitForLoadState('domcontentloaded');
  }
}
