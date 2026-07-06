import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../fixtures/users';

test('User can successfully login', async ({ page }) => {
  const login = new LoginPage(page);

  await test.step('Открыть главную страницу и убрать оверлей', async () => {
    await login.open();
    await login.skipIntroIfVisible();
  });

  await test.step('Перейти на страницу входа', async () => {
    await login.openLogin();
  });

  await test.step('Ввести учетные данные', async () => {
    await login.login(users.validUser.email, users.validUser.password);
  });

  await test.step('Проверить успешный вход', async () => {
    await login.expectLoggedIn();
  });
});