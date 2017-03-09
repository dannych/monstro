import { last } from 'lodash';
import bluebird from 'bluebird';
import moment from 'moment';

function getChannelHistoryExhaustively(repo, channel, latest, oldest, currentData) {
  return repo({ channel, latest, oldest }).then((ret) => {
    const data = currentData.concat(ret.messages || []);
    if (ret.messages.length > 0 && ret.has_more) {
      const curOldest = last(ret.messages).ts;
      return getChannelHistoryExhaustively(repo, curOldest, oldest);
    }
    return data;
  });
}

export function getTodayChannelHistory(api, channelId) {
  const channelHistoryF = bluebird.promisify(api.groups.history);
  const latest = moment();
  const oldest = moment().startOf(latest);

  return getChannelHistoryExhaustively(channelHistoryF, channelId, latest, oldest, []);
}

export function getUserList(api) {
  return bluebird.promisify(api.users.list)({});
}
