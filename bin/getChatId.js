const fetch = require('node-fetch');
require('dotenv').config();

fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getUpdates`)
  .then(res => res.json())
  .then(body => console.dir(JSON.stringify(body)));