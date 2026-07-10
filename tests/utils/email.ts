import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

export type MailProvider = 'gmail' | 'yandex';

function createClient(targetEmail: string) {
  const isYandex = targetEmail.toLowerCase().includes('yandex');
  const user = isYandex ? process.env.YANDEX_USER : process.env.GMAIL_USER;
  const pass = isYandex ? process.env.YANDEX_APP_PASSWORD : process.env.GMAIL_APP_PASSWORD;

  // Защита от запуска с пустым конфигом
  if (!user || !pass) {
    throw new Error(`[IMAP CONFIG] Критическая ошибка: Не найдены доступы для ${isYandex ? 'Yandex' : 'Gmail'} в файле env.`);
  }

  return new ImapFlow({
    host: isYandex ? 'imap.yandex.ru' : 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });
}

export function generateEmail(tag: string, provider: MailProvider): string {
  const timestamp = Date.now();

  if (provider === 'yandex') {
    const base = process.env.YANDEX_USER?.split('@')[0] || 'vi9ong';
    return `${base}+${tag}_${timestamp}@yandex.com`;
  }

  const base = process.env.GMAIL_USER?.split('@')[0] || 'islam.social.qa';
  const cleanBase = base.includes('+') ? base.split('+')[0] : base;
  return `${cleanBase}+${tag}_${timestamp}@gmail.com`;
}

export async function waitForOtpFromEmail(
  targetEmail: string,
  timeoutMs: number = 100000,
  intervalMs: number = 5000
): Promise<string> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    console.log(`[IMAP] Поиск OTP для адреса: ${targetEmail}...`);
    const client = createClient(targetEmail);
    
    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const searchResult = await client.search({ all: true });
        const uids: number[] = searchResult === false ? [] : searchResult;

        if (uids.length > 0) {
          uids.sort((a, b) => b - a);
          const recentUids = uids.slice(0, 10);

          for (const uid of recentUids) {
            const msg = await client.fetchOne(uid, { source: true });
            if (msg === false || !msg.source) continue;

            const parsed = await simpleParser(msg.source);
            const toAddress = parsed.to?.text || '';
            const text = parsed.text || parsed.html?.toString() || '';

            if (toAddress.toLowerCase().includes(targetEmail.toLowerCase())) {
              console.log(`[IMAP] Найдено подходящее письмо (UID: ${uid}). Анализируем текст...`);

              // Добавлена поддержка русской локализации "код:"
              const match =
                text.match(/Confirmation code:\s*(\d{6})/i) ||
                text.match(/code[:\s]*(\d{6})/i) ||
                text.match(/код[:\s]*(\d{6})/i) || 
                text.match(/Confirmation code[\s\S]{0,50}(\d{6})/i) ||
                text.match(/(?<!\d)(\d{6})(?!\d)/);

              if (match?.[1]) {
                console.log(`[IMAP] 🔥 УСПЕХ: OTP код успешно извлечен: ${match[1]}`);
                return match[1];
              }
            }
          }
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      console.error('[IMAP ITERATION ERROR]:', err);
    } finally {
      await client.logout().catch(() => {});
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`OTP для ${targetEmail} не был найден за ${timeoutMs / 1000} секунд.`);
}