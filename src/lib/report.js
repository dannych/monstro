import _ from 'lodash';
import moment from 'moment';

import { parse as parseStandup, DONE } from './standup';

function layoutMultiple(reports) {
  const result = [];
  reports.forEach(({ member, activity }) => {
    if (member.is_bot) return;
    if (_.isEmpty(activity)) return;

    result.push(`*${member.name}*`);
    _.forEach(activity, (actions, day) => {
      result.push(`> *${_.startCase(day)}*`);
      actions.forEach((action) => {
        result.push(`> - ${action.text}`);
      });
    });
  });

  if (!_.isEmpty(result)) {
    result.unshift('Here is your team report for this week:');
  }

  return result.join('\n');
}

function layoutSingle() {
  const result = [];

  if (!_.isEmpty(result)) {
    result.unshift('Here is your report for this week:');
  }

  return result.join('\n');
}

/**
 * output:
 * [
 *  {
 *    member: {},
 *    activity: {
 *      sunday: [{},{}]
 *      monday: [{},{}]
 *    }
 *  }
 * ]
 */
function parse(reports) {
  return reports.map(({ member, ...status }) => {
    const activity = _.groupBy(status[DONE], action =>
    _.toLower(moment.unix(action.timestamp).tz('Asia/Jakarta').format('dddd')));
    return {
      member,
      activity,
    };
  });
}

export function digestAllReport(history = [], members = []) {
  const reports = parseStandup(history, members);
  return layoutMultiple(parse(reports));
}

export function digestIndividualReport(member, history = [], members = []) {
  const report = parseStandup(history, members);
  return layoutSingle(report);
}
