import Botkit from 'botkit';
import config from './config';

const controller = Botkit.slackbot({});
controller
  .spawn({ token: config.SLACK_BOT_TOKEN })
  .startRTM();

controller
  .hears(['hi'], [], (bot, message) => {
    bot.reply(message, 'hi');
  });
