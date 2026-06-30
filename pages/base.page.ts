import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async open(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async skipIntroIfVisible() {
    await this.page.waitForTimeout(1000);
    
    // Пытаемся нажать на кнопку Skip из codegen
    const skipButton = this.page.getByRole('button', { name: 'Skip' });
    
    if (await skipButton.isVisible()) {
      await skipButton.click();
      await this.page.waitForTimeout(500);
      return;
    }

    // Если кнопки нет, но оверлей завис — удаляем его принудительно
    const overlay = this.page.locator('.tutorial-overlay');
    if (await overlay.isVisible()) {
      await this.page.evaluate(() => {
        const el = document.querySelector('.tutorial-overlay');
        if (el) el.remove();
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      });
      await this.page.waitForTimeout(500);
    }
  }
}