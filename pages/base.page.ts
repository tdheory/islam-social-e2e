import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(path: string = '/') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async skipIntroIfVisible() {
    const skipBtn = this.page.getByRole('button', { name: /skip|close|понятно|закрыть/i }).first();
    
    try {
      await skipBtn.waitFor({ state: 'visible', timeout: 3000 });
      await skipBtn.click();
      console.log('[i] Оверлей закрыт');
    } catch {
      // Игнорируем, если баннера нет
    }
  }
}