import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  
  // Включаем полную параллельность для всех файлов
  fullyParallel: true,
  
  // Если тест упал из-за сети, Playwright попробует запустить его еще раз (снижает ложные падения)
  retries: process.env.CI ? 1 : 0,
  
  // Максимальное время на ОДИН тест (60 секунд — с запасом под ожидание OTP)
  timeout: 60000,

  // В облаке используем лаконичный отчет 'dot', локально — красивый 'html'
  reporter: [['html', { open: 'never' }]],
  
use: {
    baseURL: 'https://islam.social',
    ignoreHTTPSErrors: true, // 🔥 ДОБАВЬ ЭТУ СТРОЧКУ СЮДА
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    locale: 'en-US', 
    launchOptions: {
      args: ['--disable-features=Translate']
    },
  },
  
  // Настраиваем запуск в трех основных браузерах (если хочешь ускорить в 3 раза, оставь только chromium)
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});