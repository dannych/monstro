import { last } from 'lodash';
import bluebird from 'bluebird';
import moment from 'moment-timezone';

const timezone = 'Asia/Jakarta';

function getChannelHistoryExhaustively(repo, channel, latest, oldest, currentData) {
  return repo({ channel, latest, oldest, count: 1000 }).then((ret) => {
    const data = currentData.concat(ret.messages || []);
    if (ret.messages.length > 0 && ret.has_more) {
      const curOldest = last(ret.messages).ts;
      return getChannelHistoryExhaustively(repo, channel, latest, curOldest, data);
    }
    return data;
  });
}

export function getThisWeekChannelHistory(api, channelId) {
  const channelHistoryF = bluebird.promisify(api.groups.history);
  const latest = moment.tz(timezone);
  const oldest = moment.tz(timezone).startOf('week');
  return getChannelHistoryExhaustively(channelHistoryF,
    channelId, latest.unix(), oldest.unix(), []);
}

export function getTodayChannelHistory(api, channelId) {
  const channelHistoryF = bluebird.promisify(api.groups.history);
  const latest = moment.tz(timezone);
  const oldest = moment.tz(timezone).startOf('day');
  return getChannelHistoryExhaustively(channelHistoryF,
    channelId, latest.unix(), oldest.unix(), []);
}

export function getUserList(api) {
  return bluebird.promisify(api.users.list)({})
    .then(x => x.members);
}
