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

/**
 * Генерирует уникальный email для каждого прогона теста
 */
export function generateTestEmail(tag: string): string {
  return `islamsocial.qa+${tag}_${Date.now()}@gmail.com`;
}

/**
 * 🔥 Ожидает OTP код из письма, отправленного на конкретный уникальный email.
 */
export async function waitForOtpFromEmail(
  targetEmail: string,
  timeoutMs: number = 120000,
  intervalMs: number = 5000
): Promise<string> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    console.log(`Checking for NEW OTP sent to: ${targetEmail}...`);

    const client = createClient();
    
    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const searchResult = await client.search({ from: 'info@islam.social' });
        const uids: number[] = searchResult === false ? [] : searchResult;

        if (uids.length > 0) {
          uids.sort((a, b) => b - a);
          const recentUids = uids.slice(0, 5);

          for (const uid of recentUids) {
            const msg = await client.fetchOne(uid, { source: true });
            
            // 🔥 FIX: Явное сужение типа для TypeScript.
            // Если msg равен false или у него нет source, то пропускаем.
            if (msg === false || !msg.source) {
              continue;
            }

            // Теперь TypeScript на 100% уверен, что msg — это объект, и ошибка исчезнет
            const parsed = await simpleParser(msg.source);
            const toAddress = parsed.to?.text || '';

            if (!toAddress.toLowerCase().includes(targetEmail.toLowerCase())) {
              continue;
            }

            const text = parsed.text || parsed.html?.toString() || '';

            const match =
              text.match(/Confirmation code:\s*(\d{6})/i) ||
              text.match(/code[:\s]+(\d{6})/i) ||
              text.match(/(?<!\d)(\d{6})(?!\d)/);

            if (match?.[1]) {
              console.log('====================================');
              console.log('🔥 SUCCESS: OTP FOUND FOR CURRENT TEST!');
              console.log(`Email To: ${toAddress}`);
              console.log(`Code: ${match[1]}`);
              console.log('====================================');
              return match[1];
            }
          }
        }
      } finally {
        lock.release();
      }
    } catch (err) {
      console.error('Ошибка при обращении к IMAP (будет повторная попытка):', err);
    } finally {
      await client.logout().catch(() => {});
    }

    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`OTP for ${targetEmail} not received within timeout`);
}