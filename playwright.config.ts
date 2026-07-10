import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // На CI даем 2 попытки для стабильности из-за возможных сетевых задержек почты
  retries: process.env.CI ? 2 : 0, 
  
  timeout: 120000, 
  reporter: [
    ['html', { open: 'never' }],
    ['list'] // Добавлен для красивого и понятного логирования шагов в консоли
  ],
  
  use: {
    // Позволяет динамически подменять URL для локального тестирования в Docker или GitLab
    baseURL: process.env.BASE_URL || 'https://islam.social',
    ignoreHTTPSErrors: true,
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure', // Записывает трассировку только для упавших тестов (экономит память)
    locale: 'en-US', 
    launchOptions: {
      args: ['--disable-features=Translate']
    },
  },
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});