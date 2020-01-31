# Site checker
A telegram bot that checks sites for appropiate status codes and messages if a site is down.

Add sites to check in config.js

## Environment variables
To make the bot work copy .env.sample to .env and change the following variables.

### TELEGRAM_TOKEN
The API token for the bot you want to send messages from. Get it at https://core.telegram.org/bots/api#authorizing-your-bot.

### TELEGRAM_CHAT_ID
The chat ID of your user with the bot.

How to get it:

+ Send a message to your bot from the telegram client you want to receive messages on
+ Run ``node getChatId``
+ Look through the response for your message and your chat_id should be in there

### SITES_TO_CHECK
Comma seperated list of sites to check eg: https://example.com, https://example2.com