import { test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { users } from '../fixtures/users';

test('login flow', async ({ page }) => {
  const login = new LoginPage(page);

  // 1. Открыть главную страницу и убрать оверлей (если он есть)
  await login.open();
  await login.skipIntroIfVisible();

  // 2. Перейти на страницу входа
  await login.openLogin();

  // 3. Ввести учетные данные статичного пользователя из фикстур
  await login.login(users.validUser.email, users.validUser.password);

  // 4. Проверить, что вход выполнен успешно и интерфейс обновился
  await login.expectLoggedIn();
});