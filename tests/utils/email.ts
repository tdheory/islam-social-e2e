import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Динамически создает клиент IMAP в зависимости от домена почты
 */
function createClient(targetEmail: string) {
  const isYandex = targetEmail.toLowerCase().includes('yandex');

  return new ImapFlow({
    host: isYandex ? 'imap.yandex.ru' : 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: isYandex ? process.env.YANDEX_USER! : process.env.GMAIL_USER!,
      pass: isYandex ? process.env.YANDEX_APP_PASSWORD! : process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false,
  });
}

/**
 * ЕДИНЫЙ ГЕНЕРАТОР ПОЧТЫ
 * Автоматически создаёт Gmail или Yandex адрес на основе переменной MAIL_PROVIDER в .env
 */
export function generateEmail(tag: string): string {
  const provider = (process.env.MAIL_PROVIDER || 'gmail').toLowerCase();
  const timestamp = Date.now();

  if (provider === 'yandex') {
    const base = process.env.YANDEX_USER?.split('@')[0] || 'username';
    return `${base}+${tag}_${timestamp}@yandex.ru`;
  }

  // По умолчанию генерируем Gmail
  const base = process.env.GMAIL_USER?.split('@')[0] || 'islamsocial.qa';
  // На случай, если в GMAIL_USER уже указан тег с плюсом, отсекаем его для чистоты
  const cleanBase = base.includes('+') ? base.split('+')[0] : base;
  return `${cleanBase}+${tag}_${timestamp}@gmail.com`;
}

/**
 * Универсальная функция ожидания OTP.
 */
export async function waitForOtpFromEmail(
  targetEmail: string,
  timeoutMs: number = 120000,
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
            
            if (msg === false || !msg.source) {
              continue;
            }

            const parsed = await simpleParser(msg.source);
            const toAddress = parsed.to?.text || '';
            const text = parsed.text || parsed.html?.toString() || '';

            if (toAddress.toLowerCase().includes(targetEmail.toLowerCase())) {
              console.log(`[IMAP] Найдено подходящее письмо (UID: ${uid}). Анализируем текст...`);

              const match =
                text.match(/Confirmation code:\s*(\d{6})/i) ||
                text.match(/code[:\s]*(\d{6})/i) ||
                text.match(/Confirmation code[\s\S]{0,50}(\d{6})/i) ||
                text.match(/(?<!\d)(\d{6})(?!\d)/);

              if (match?.[1]) {
                console.log(`[IMAP] 🔥 УСПЕХ: OTP код успешно извлечен: ${match[1]}`);
                return match[1];
              } else {
                console.log(`[IMAP] Предупреждение: письмо найдено, но код не распознан.`);
              }
            }
          }
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      console.error('[IMAP ERROR]:', err);
    } finally {
      await client.logout().catch(() => {});
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`OTP для ${targetEmail} не был найден за ${timeoutMs / 1000} секунд.`);
}