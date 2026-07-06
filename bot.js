import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { exec } from 'child_process';

// Загружаем переменные из .env
dotenv.config();

const token = process.env.TELEGRAM_TOK;
const allowedChatId = process.env.TELEGRAM_TO;
const ghToken = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

// Запускаем бота в режиме "слушателя" (polling)
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот успешно запущен и слушает команды...');

// Слушаем команду /start
bot.onText(/\/start/, (msg) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  
  bot.sendMessage(allowedChatId, 'Привет! Я твой QA-бот. Нажми кнопку ниже, чтобы запустить автотесты в облаке GitHub!', {
    reply_markup: {
      keyboard: [[{ text: '🚀 Запустить тесты' }]],
      resize_keyboard: true
    }
  });
});

// Слушаем нажатие кнопки или текст
bot.on('message', async (msg) => {
  if (msg.chat.id.toString() !== allowedChatId) return;
  if (msg.text !== '🚀 Запустить тесты') return;

  bot.sendMessage(allowedChatId, '⏳ Отправляю запрос на GitHub Actions... Минутку.');

  // Формируем специальный запрос к GitHub API (через утилиту curl)
  const curlCommand = `curl -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ${ghToken}" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/${owner}/${repo}/actions/workflows/playwright.yml/dispatches \
    -d "{\\"ref\\":\\"main\\"}"`;

  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка выполнения: ${error}`);
      bot.sendMessage(allowedChatId, '❌ Не удалось запустить тесты. Проверь логи в консоли бота.');
      return;
    }
    bot.sendMessage(allowedChatId, '🛫 Тесты успешно запущены в облаке! Как только они завершатся, я пришлю тебе отчет.');
  });
});