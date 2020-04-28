const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
const prettyMilliseconds = require('pretty-ms');
require('dotenv').config();

// const SiteDownError = require('./SiteDownError');

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/`;

let uptime = 0;
let muted = false;

const down = {};

// Send message to notify startup
telegram("Bleep bloop started up!");

// Check all sites every 30 seconds
checkAll();
setInterval(() => {
  uptime += 30000;

  if(!muted) {
    checkAll();
  }

}, 30000);

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
    .then(({ ok, status }) => {
      if(ok) {
        if(down[site]) {
          notifyBack(site);
        }
      } else {
        notifyDown(site, `Site: ${site} is down with status code: ${status}.`);
      }
    })
    .catch(({ message }) => {
      notifyDown(site, `Site: ${site} is down with error: ${message}`);
    });
}

function notifyBack(site) {
  const minutesOffline = Math.floor(Math.abs(down[site].downAt - new Date()) / 60000);
  telegram(`Site: ${site} is back online after ${minutesOffline} minutes!`);
  console.log(`${site} is back`);
  delete down[site];
}

/**
 * Telegram the error
 * @param {string} site
 * @param {string} message
 */
function notifyDown(site, message) {
  if (!down[site]) {
    console.log(`${site} is down for the first time`);
    down[site] = {
      message,
      downAt: new Date(),
    };

    telegram(message);
  } else {
    console.log(`${site} is still down`);
  }
}

/**
 * Sends a telegram message to the chat in the environment
 * @param {string} message Message to send
 */
function telegram(message) {
  fetch(`${TELEGRAM_API_URL}sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${message}`)
    .catch(console.error);
}

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

// Matches "/help"
bot.onText(/\/help/, (msg, match) => {
  console.log("Help request");
  if(!isMe(msg.chat.id)) return;
  telegram(
    "/check [site] will check a site," +
    "/check will check all sites in the environment," + 
    "/uptime for uptime," +
    "/mute [minutes] for muting messages." +
    "/unmute for unmuting" 
  );
});

// Matches "/check [whatever]"
bot.onText(/\/check(.+)?/, (msg, match) => {
  console.log("Check request");
  if(!isMe(msg.chat.id)) return;

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
  if(!isMe(msg.chat.id)) return;
  telegram(`Uptime: ${prettyMilliseconds(uptime)}`);
});

// Matches "/mute [whatever]"
bot.onText(/\/mute(.+)?/, (msg, match) => {
  console.log("Mute Request");
  if(!isMe(msg.chat.id)) return;
  const minutes = parseInt(match[1]);
  const millis = (minutes * 60) * 1000;
  telegram(`Muting for ${minutes} minutes`);

  muted = true;
  setTimeout(() => muted = false, millis);
});

// Matches "/unmute
bot.onText(/\/unmute/, (msg, match) => {
  console.log("Unmute Request");
  if(!isMe(msg.chat.id)) return;
  telegram("Unmuting");

  muted = false;
});

function isMe(chatId) {
  return chatId.toString().trim() === process.env.TELEGRAM_CHAT_ID.toString().trim();
}
