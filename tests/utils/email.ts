import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';

dotenv.config();

const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER!,
        pass: process.env.GMAIL_APP_PASSWORD!,
    },
});

export async function getLatestEmail() {
    await client.connect();

    // открываем INBOX
    let lock = await client.getMailboxLock('INBOX');

    try {
        // ищем последние письма
        const messages = await client.fetch('1:*', {
            envelope: true,
            source: true,
        });

        let latestEmail: any = null;

        for await (let msg of messages) {
            latestEmail = msg;
        }

        if (!latestEmail) {
            throw new Error('Письма не найдены');
        }

        const parsed = await simpleParser(latestEmail.source);

        console.log('FROM:', parsed.from?.text);
        console.log('SUBJECT:', parsed.subject);
        console.log('TEXT:', parsed.text);

        return parsed;
    } finally {
        lock.release();
        await client.logout();
    }
}

export function generateTestEmail(tag: string) {
    const timestamp = Date.now();
    return `victor.automation+${tag}_${timestamp}@gmail.com`;
}

export async function waitForOtpFromEmail(
    timeoutMs = 60000,
    intervalMs = 5000
): Promise<string | null> {

    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        console.log('Checking email for OTP...');

        const email = await getLatestEmail();
        const text = email.text || '';

        const match = text.match(/\b\d{4,8}\b/);

        if (match) {
            console.log('OTP FOUND:', match[0]);
            return match[0];
        }

        console.log('OTP not found yet, waiting...');
        await new Promise(res => setTimeout(res, intervalMs));
    }

    throw new Error('OTP not received within timeout');
}