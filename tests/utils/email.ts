import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

function createClient() {
  return new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
    logger: false,
  });
}

export function generateTestEmail(tag: string): string {
  return `islamsocial.qa+${tag}_${Date.now()}@gmail.com`;
}

export async function waitForOtpFromEmail(
  targetEmail: string,
  timeoutMs: number = 120000,
  intervalMs: number = 5000
): Promise<string> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    console.log(`[IMAP] Поиск OTP для адреса: ${targetEmail}...`);

    const client = createClient();
    
    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const searchResult = await client.search({ all: true });
        const uids: number[] = searchResult === false ? [] : searchResult;

        if (uids.length > 0) {
          // Сортируем от новых к старым и берем 10 последних для надежности
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

            // Мягкая проверка на вхождение целевого email
            if (toAddress.toLowerCase().includes(targetEmail.toLowerCase())) {
              console.log(`[IMAP] Найдено подходящее письмо (UID: ${uid}). Анализируем текст...`);

              // Все твои оригинальные регулярные выражения
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