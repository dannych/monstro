import Botkit from 'botkit';
import bluebird from 'bluebird';

import config from './config';
import { getThisWeekChannelHistory, getTodayChannelHistory, getUserList } from './lib/slack';
import { summarizeStandup } from './lib/standup';
import { digestAllReport, digestIndividualReport } from './lib/report';

const controller = Botkit.slackbot({});
controller.setupWebserver(config.PORT);

controller
  .spawn({ token: config.SLACK_BOT_TOKEN })
  .startRTM();

controller.hears(['hi'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.reply(message, 'hi');
});

controller.hears(['summarize'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.startTyping(message);

  const todayHistory = getTodayChannelHistory(bot.api, config.SLACK_CHANNEL_ID);
  const membersInfo = getUserList(bot.api);

  bluebird.join(todayHistory, membersInfo, (history, members) => {
    bot.reply(message, summarizeStandup(history, members));
  });
});

controller.hears(['digest'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.startTyping(message);

  const todayHistory = getThisWeekChannelHistory(bot.api, config.SLACK_CHANNEL_ID);
  const membersInfo = getUserList(bot.api);

  bluebird.join(todayHistory, membersInfo, (history, members) => {
    bot.reply(message, digestAllReport(history, members));
  });
});

controller.hears(['gulp'], ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
  bot.startTyping(message);

  const todayHistory = getThisWeekChannelHistory(bot.api, config.SLACK_CHANNEL_ID);
  const membersInfo = getUserList(bot.api);

  bluebird.join(todayHistory, membersInfo, (history, members) => {
    const user = members.find(member => member.id === message.user);
    bot.reply(message, digestIndividualReport(user, history, members));
  });
});
