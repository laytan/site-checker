const fetch = require('node-fetch');
require('dotenv').config();

const SiteDownError = require('./SiteDownError');

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/`;

let uptime = 0;

checkAll();
setInterval(checkAll, 60000);
setInterval(() => {
  uptime += 3600000;
  telegram(`I am still running! Uptime: ${uptime / 1000} hours`);
}, 3600000);
telegram("Bleep bloop started up!");

function getSites() {
  let sitesToCheck = process.env.SITES_TO_CHECK.split(',');
  return sitesToCheck.map(site => site.trim());
}

function checkAll() {
  console.log("Checking");
  getSites().forEach(check);
}

function check(site) {
  fetch(site)
    .then(checkStatus)
    .catch(notifyDown);
}

function notifyDown(err) {
  if(err.constructor.name === 'FetchError') {
    telegram(err.message);
    console.error("Tried to ping site that does not exist");
  } else if(err.constructor.name === 'SiteDownError') {
    telegram(err.message);
    console.log("Site is down", err);
  } else {
    telegram(err.message);
    console.error(err);
  }
}

function telegram(message) {
  fetch(`${TELEGRAM_API_URL}sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${message}`)
    .catch(console.error);
}

function checkStatus(res) {
  if (res.ok) {
      return res;
  } else {
      throw new SiteDownError(res);
  }
}
