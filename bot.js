import dotenv from 'dotenv';
dotenv.config(); // Сразу заряжаем переменные окружения

import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOK;
const allowedChatId = process.env.TELEGRAM_TO;
const ghToken = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот запущен и готов к управлению тестами...');

// Главное меню с кнопками
const mainMenu = {
  reply_markup: {
    keyboard: [
      [{ text: '🌐 Проверить открытие сайта (Smoke)' }],
      [{ text: '🔑 Проверить вход (Login)' }],
      [{ text: '📝 Проверить регистрацию (Registration)' }]
    ],
    resize_keyboard: true
  }
};

// Функция для отправки запроса в GitHub Actions
async function triggerGitHubWorkflow(testType, chatWithUser) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/playwright.yml/dispatches`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${ghToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main', // Ветка
        inputs: { test_type: testType } // Передаем тип теста на GitHub
      })
    });

    if (response.ok) {
      bot.sendMessage(chatWithUser, `🛫 Запрос принят! GitHub Actions начинает сценарий: *${testType}*.%0AЖди отчет от бота.`, { parse_mode: 'Markdown' });
    } else {
      const errorText = await response.text();
      console.error('Ошибка GitHub API:', errorText);
      bot.sendMessage(chatWithUser, `❌ Ошибка GitHub API: ${response.status}. Проверь токены.`);
    }
  } catch (err) {
    console.error('Ошибка сети:', err);
    bot.sendMessage(chatWithUser, '❌ Не удалось связаться с сервером GitHub.');
  }
}

// Слушаем ВСЕ входящие сообщения
bot.on('message', async (msg) => {
  const chatId = msg.chat.id.toString();
  
  // Полезный лог для отладки Chat ID
  console.log(`✉️ Сообщение от Telegram ID [${chatId}]: "${msg.text}"`);

  // Проверка безопасности: если ID не совпадает с .env
  if (chatId !== allowedChatId) {
    console.log(`⚠️ [Блокировка] Доступ заблокирован для ID ${chatId}. Проверь TELEGRAM_TO в файле .env`);
    return;
  }

  // Обработка команд
  switch (msg.text) {
    case '/start':
      bot.sendMessage(chatId, 'Привет! Выбери, какую проверку для сайта *islam.social* ты хочешь запустить прямо сейчас:', mainMenu);
      break;

    case '🌐 Проверить открытие сайта (Smoke)':
      bot.sendMessage(chatId, '⏳ Связываюсь с облаком для проверки доступности сайта...');
      await triggerGitHubWorkflow('smoke', chatId);
      break;

    case '🔑 Проверить вход (Login)':
      bot.sendMessage(chatId, '⏳ Запускаю автотест авторизации пользователя...');
      await triggerGitHubWorkflow('login', chatId);
      break;

    case '📝 Проверить регистрацию (Registration)':
      bot.sendMessage(chatId, '⏳ Отправляю команду на тест регистрации новых аккаунтов...');
      await triggerGitHubWorkflow('registration', chatId);
      break;

    default:
      bot.sendMessage(chatId, 'Используй кнопки в меню для запуска тестов.', mainMenu);
  }
});