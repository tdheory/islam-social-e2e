import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../fixtures/users';

test('login flow', async ({ page }) => {
  const login = new LoginPage(page);

  await login.open();
  await login.skipIntroIfVisible();
  await login.openLogin();

  await login.login(users.validUser.email, users.validUser.password);

  await login.expectLoggedIn();
});