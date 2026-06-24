import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('login flow', async ({ page }) => {
  const login = new LoginPage(page);

  await login.open();
  await login.skipIntroIfVisible();
  await login.openLogin();

  await login.login(
    'victor.ivanisov.family@gmail.com',
    'Posuda15'
  );

  await login.expectLoggedIn();
});