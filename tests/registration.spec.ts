import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../pages/registration.page';
import { generateEmail, waitForOtpFromEmail, MailProvider } from './utils/email';

const providers: MailProvider[] = ['gmail', 'yandex'];

for (const provider of providers) {
  test(`User can successfully complete registration up to OTP via ${provider.toUpperCase()}`, async ({ page }) => {
    const registration = new RegistrationPage(page);

    const email = generateEmail('register', provider);
    const password = `Password${Date.now()}!`;
    const name = `TestUser_${Date.now()}`;

    await test.step(`Заполнить форму регистрации (${provider})`, async () => {
      await registration.open();
      await registration.skipIntroIfVisible();
      await registration.openRegistration();
      await registration.register(name, email, password);
    });

    let otp = '';
    await test.step('Получить OTP код из почты', async () => {
      console.log(`Ожидание OTP для ${email}...`);
      otp = await waitForOtpFromEmail(email, 100000, 5000); 
    });

    await test.step('Ввести OTP и проверить переход к шагу телефона', async () => {
      await registration.enterOtp(otp);

      // Проверяем, что OTP принят и открылся шаг ввода телефона
      // Ищем на странице поле ввода телефона или упоминание номера
      const phoneStepElement = page.locator(
        'input[type="tel"], input[placeholder*="phone" i], input[placeholder*="номер" i], input[placeholder*="телефон" i], [class*="phone"]'
      ).first();

      await expect(phoneStepElement).toBeVisible({ timeout: 15000 });
      console.log(`✅ OTP успешно подтвержден для ${provider}! Открылся шаг ввода номера телефона.`);
    });
  });
}