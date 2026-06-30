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
    console.log(`\n--- [CHECK] Ищем OTP для: ${targetEmail} ---`);

    const client = createClient();
    
    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        // Убираем жесткий фильтр 'from', пробуем искать просто последние письма (all: true),
        // чтобы исключить проблему, если Gmail не хочет фильтровать по info@islam.social
        const searchResult = await client.search({ all: true });
        const uids: number[] = searchResult === false ? [] : searchResult;

        console.log(`[DEBUG] Всего писем в INBOX: ${uids.length}`);

        if (uids.length > 0) {
          // Сортируем от новых к старым
          uids.sort((a, b) => b - a);
          
          // Берем последние 10 писем для анализа
          const recentUids = uids.slice(0, 10);
          console.log(`[DEBUG] Анализируем последние UIDs: ${recentUids.join(', ')}`);

          for (const uid of recentUids) {
            const msg = await client.fetchOne(uid, { source: true });
            
            if (msg === false || !msg.source) {
              console.log(`[DEBUG] UID ${uid}: пустой source или false`);
              continue;
            }

            const parsed = await simpleParser(msg.source);
            const toAddress = parsed.to?.text || '';
            const fromAddress = parsed.from?.text || '';
            const subject = parsed.subject || '';
            const text = parsed.text || parsed.html?.toString() || '';

            console.log(` -> Письмо UID ${uid}:`);
            console.log(`    От: ${fromAddress}`);
            console.log(`    Кому: ${toAddress}`);
            console.log(`    Тема: ${subject}`);

            // Проверяем, относится ли письмо к нашему тесту
            // Используем более мягкую проверку (просто вхождение алиаса без учета регистра)
            const isOurEmail = toAddress.toLowerCase().includes(targetEmail.toLowerCase());
            
            if (!isOurEmail) {
              console.log(`    [SKIPPED] Письмо не для текущего теста.`);
              continue;
            }

            console.log(`    [MATCH] Письмо НАШЕ! Парсим текст на наличие кода...`);
            console.log(`    [TEXT PREVIEW]: ${text.substring(0, 200)}...`); // выведем начало текста для отладки

            // Расширенное регулярное выражение. Ищет любые 6 цифр после слов Confirmation/code/Код
            const match =
              text.match(/Confirmation code:\s*(\d{6})/i) ||
              text.match(/code[:\s]*(\d{6})/i) ||
              text.match(/Confirmation code[\s\S]{0,50}(\d{6})/i) ||
              text.match(/(?<!\d)(\d{6})(?!\d)/); // Просто любые 6 цифр подряд, изолированные от других цифр

            if (match?.[1]) {
              console.log('====================================');
              console.log('УСПЕХ: OTP КОД УСПЕШНО НАЙДЕН!');
              console.log(`Код: ${match[1]}`);
              console.log('====================================');
              return match[1];
            } else {
              console.log(`    [ERROR] Наше письмо нашли, но регулярка не смогла вытащить 6 цифр!`);
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

    // Ждем перед следующим витком цикла
    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`OTP для ${targetEmail} не был найден за ${timeoutMs / 1000} секунд.`);
}