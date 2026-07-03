import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registration.page';
import { LoginPage } from '../pages/login.page';
// Импортируем ЕДИНЫЙ чистый генератор
import { generateEmail, waitForOtpFromEmail } from './utils/email';

test('user can register, logout and login again successfully', async ({ page }) => {
  const registration = new RegistrationPage(page);
  const login = new LoginPage(page);

  // Провайдер выберется автоматически из .env!
  const email = generateEmail('register');
  const password = `Password${Date.now()}!`;
  const name = `TestUser_${Date.now()}`;

  console.log('STEP 1-4: Open, skip intro, and fill registration form');
  await registration.open();
  await registration.skipIntroIfVisible();
  await registration.openRegistration();
  await registration.register(name, email, password);

  console.log(`STEP 5: Wait for OTP in email for ${email}`);
  const otp = await waitForOtpFromEmail(email, 120000, 5000); 

  console.log('STEP 6: Enter OTP code');
  await registration.enterOtp(otp);

  console.log('STEP 7: Verify registration success (UI-based)');
  await expect(page.getByText(/welcome|dashboard|profile|success|feed|home/i).first())
    .toBeVisible({ timeout: 15000 });

  console.log('STEP 8: Logout');
  const accountBtn = page.getByRole('button', { name: /account|profile|menu/i }).first();
  await accountBtn.waitFor({ state: 'visible' });
  await accountBtn.click();

  const logoutBtn = page.getByRole('button', { name: /sign out|log out|logout/i }).first();
  await logoutBtn.waitFor({ state: 'visible' });
  await logoutBtn.click();

  await expect(page.getByRole('link', { name: /Log\s?in|Login|Sign in/i }).first())
    .toBeVisible({ timeout: 10000 });

  console.log('STEP 9: Login with new user');
  await login.open();
  await login.skipIntroIfVisible();
  await login.openLogin();
  await login.login(email, password);

  console.log('STEP 10: Verify login success');
  await expect(page.getByText(/dashboard|profile|feed|home/i).first())
    .toBeVisible({ timeout: 15000 });
  await login.expectLoggedIn();
});