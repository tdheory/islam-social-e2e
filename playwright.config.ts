import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  
  // Увеличили таймаут до 120с, чтобы дождаться писем
  timeout: 120000, 
  reporter: [['html', { open: 'never' }]],
  
  use: {
    baseURL: 'https://islam.social',
    ignoreHTTPSErrors: true,
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
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});