const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const prettyMilliseconds = require('pretty-ms');
require('dotenv').config();

const SiteDownError = require('./SiteDownError');

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/`;

let uptime = 0;

// Send message to notify startup
telegram("Bleep bloop started up!");

// Check all sites every 60 seconds
checkAll();
setInterval(() => {
  uptime += 60000;
  checkAll();
}, 60000);

// Send a message every hour notifying that the bot is still running
setInterval(() => {
  telegram(`I am still running! Uptime: ${prettyMilliseconds(uptime)}`);
}, 3600000);

/**
 * Split the environment on commas for sites to check
 */
function getSites() {
  let sitesToCheck = process.env.SITES_TO_CHECK.split(',');
  return sitesToCheck.map(site => site.trim());
}

/**
 * Check all sites in the environment
 */
function checkAll() {
  console.log("Checking");
  getSites().forEach(check);
}

/**
 * Sends a GET request to the site and if it is down pass it to notifyDown
 * @param {string} site url
 */
function check(site) {
  fetch(site)
    .then(checkStatus)
    .catch(notifyDown);
}

/**
 * Telegram the error
 * @param {Error} err the error to notify about
 */
function notifyDown(err) {
  console.log(err);
  telegram(err.message);
}

/**
 * Sends a telegram message to the chat in the environment
 * @param {string} message Message to send
 */
function telegram(message) {
  fetch(`${TELEGRAM_API_URL}sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${message}`)
    .catch(console.error);
}

/**
 * Checks for a statuscode that is not between 200 and 300
 * @param {Response} res response to get request of a site
 */
function checkStatus(res) {
  if (res.ok) {
      return res;
  } else {
      throw new SiteDownError(res);
  }
}

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

// Matches "/help"
bot.onText(/\/help/, (msg, match) => {
  console.log("Help request");
  const chatId = msg.chat.id;
  if(chatId !== process.env.TELEGRAM_CHAT_ID) {
    return;
  }

  telegram("/check [site] will check a site, /check will check all sites in the environment, /uptime for uptime");
});

// Matches "/check [whatever]"
bot.onText(/\/check(.+)?/, (msg, match) => {
  console.log("Check request");
  const chatId = msg.chat.id;
  if(chatId !== process.env.TELEGRAM_CHAT_ID) {
    return;
  }

  const toCheck = match[1];
  console.log(toCheck);
  // Check specified url
  if(toCheck && toCheck.length > 0) {
    telegram(`Checking: ${toCheck}`);
    check(toCheck);
  } else {
    telegram("Checking all sites");
    checkAll();
  }
});

// Matches "/uptime [whatever]"
bot.onText(/\/uptime/, (msg, match) => {
  console.log("Uptime request");
  const chatId = msg.chat.id;
  if(chatId !== process.env.TELEGRAM_CHAT_ID) {
    return;
  }
  telegram(`Uptime: ${prettyMilliseconds(uptime)}`);
});