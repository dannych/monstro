import _ from 'lodash';
import moment from 'moment';

import config from '../config';
import { parse as parseStandup, DONE } from './standup';

const timezone = config.TIMEZONE;

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

function layoutSingle({ activity }) {
  const result = [];

  _.forEach(activity, (actions, day) => {
    result.push(`> *${_.startCase(day)}*`);
    actions.forEach((action) => {
      result.push(`> - ${action.text}`);
    });
  });

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
    _.toLower(moment.unix(action.timestamp).tz(timezone).format('dddd')));
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
  const reports = parseStandup(history, members);
  const parsedReports = parse(reports);
  return layoutSingle(parsedReports.find(report => report.member.id === member.id));
}
