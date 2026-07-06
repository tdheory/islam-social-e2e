import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registration.page';
import { LoginPage } from '../pages/login.page';
import { generateEmail, waitForOtpFromEmail } from './utils/email';

test('User can register, logout and login again successfully', async ({ page }) => {
  const registration = new RegistrationPage(page);
  const login = new LoginPage(page);

  const email = generateEmail('register');
  const password = `Password${Date.now()}!`;
  const name = `TestUser_${Date.now()}`;

  await test.step('Заполнить форму регистрации', async () => {
    await registration.open();
    await registration.skipIntroIfVisible();
    await registration.openRegistration();
    await registration.register(name, email, password);
  });

  let otp = '';
  await test.step('Получить OTP код из почты', async () => {
    console.log(`Ожидание OTP для ${email}...`);
    otp = await waitForOtpFromEmail(email, 120000, 5000); 
  });

  await test.step('Ввести OTP и проверить регистрацию', async () => {
    await registration.enterOtp(otp);
    await expect(page.getByText(/welcome|dashboard|profile|success|feed|home/i).first())
      .toBeVisible({ timeout: 15000 });
  });

  await test.step('Выйти из аккаунта (Logout)', async () => {
    const accountBtn = page.getByRole('button', { name: /account|profile|menu/i }).first();
    await accountBtn.waitFor({ state: 'visible' });
    await accountBtn.click();

    const logoutBtn = page.getByRole('button', { name: /sign out|log out|logout/i }).first();
    await logoutBtn.waitFor({ state: 'visible' });
    await logoutBtn.click();

    await expect(page.getByRole('link', { name: /log\s?in|sign in/i }).first())
      .toBeVisible({ timeout: 10000 });
  });

  await test.step('Авторизоваться под новым пользователем', async () => {
    await login.openLogin();
    await login.login(email, password);
    await login.expectLoggedIn();
  });
});