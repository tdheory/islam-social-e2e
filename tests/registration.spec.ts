import { test } from '@playwright/test';
import { RegistrationPage } from '../pages/registration.page';
import { generateTestEmail, waitForOtpFromEmail } from './utils/email';

test('user can register successfully', async ({ page }) => {
  const registration = new RegistrationPage(page);

  const email = generateTestEmail('register1');

  const password = `Password${Date.now()}`;
  const name = `TestUser${Date.now()}`;

  console.log('STEP 1: open');
  await registration.open();

  console.log('STEP 2: skip intro');
  await registration.skipIntroIfVisible();

  console.log('STEP 3: open registration');
  await registration.openRegistration();

  console.log('STEP 4: fill form');
  await registration.register(name, email, password);

  console.log('STEP 5: wait OTP (Gmail)');
  const otp = await waitForOtpFromEmail(120000, 5000);

  // 🔥 защита от null (обязательно)
  if (!otp) {
    throw new Error('OTP was not received from Gmail');
  }

  console.log('OTP:', otp);

  console.log('STEP 6: enter OTP');
  await registration.enterOtp(otp);

  console.log('STEP 7: verify success');
  await registration.expectRegistered();
});