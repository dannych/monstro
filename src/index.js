import Botkit from 'botkit';
import bluebird from 'bluebird';

import config from './config';
import { getTodayChannelHistory, getUserList } from './lib/slack';
import { summarizeStandup, STANDUP_CHANNEL_ID } from './lib/standup';

const controller = Botkit.slackbot({});

controller
  .spawn({ token: config.SLACK_BOT_TOKEN })
  .startRTM();

controller.hears(['hi'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'hi');
});

controller.hears(['summarize'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  const todayHistory = getTodayChannelHistory(bot.api, STANDUP_CHANNEL_ID);
  const membersInfo = getUserList(bot.api);

  bluebird.join(todayHistory, membersInfo, (history, members) => {
    bot.reply(message, summarizeStandup(history, members));
  });
});
