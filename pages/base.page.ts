import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Универсальный метод открытия страниц
  async open(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Метод для пропуска приветственных экранов или куки-баннеров
  async skipIntroIfVisible() {
    // Ищем кнопку закрытия/пропуска (замени локатор на тот, что реально на сайте)
    const skipBtn = this.page.getByRole('button', { name: /skip|close|понятно/i }).first();
    
    // Проверяем, есть ли она на экране (ждем максимум 3 секунды, чтобы не тормозить тест)
    const isVisible = await skipBtn.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      console.log('Найден оверлей, закрываем...');
      await skipBtn.click();
    }
  }
}