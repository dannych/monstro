import _ from 'lodash';

export const ISSUE = 'issue';
export const DONE = 'done';
export const NEXT = 'next';
export const WIP = 'wip';

function createEmptyResult(members) {
  return members.map(member => ({
    member,
    [ISSUE]: [],
    [DONE]: [],
    [NEXT]: [],
    [WIP]: [],
  }));
}

function sanitizeText(message) {
  return message.replace(/\u200B/g, '');
}

function isStandupAction(text) {
  return _.startsWith(text, '*') || _.startsWith(text, '-');
}

function isStandupPhase(text) {
  const phases = [ISSUE, DONE, NEXT, WIP];
  const target = text.toLowerCase();
  return _.find(phases, phase => _.includes(target, phase));
}

function isStandupMessage(message) {
  const firstLine = _.chain(message.text)
    .split('\n')
    .first()
    .trim()
    .value();
  return isStandupPhase(firstLine);
}

function transformStandupAction(action, timestamp) {
  const text = _.chain(action).trim(' -*_').value();
  return {
    slug: _.snakeCase(text),
    timestamp,
    text,
  };
}

function updateStandupResult(result, message) {
  const appropriateInfo = result.find(info => info.member.id === message.user);
  const text = sanitizeText(message.text);

  let mode; let phase;
  text.split('\n').forEach((line) => {
    phase = isStandupPhase(line);
    if (mode && isStandupAction(line)) {
      const action = transformStandupAction(line, message.ts);
      appropriateInfo[mode].push(action);
      appropriateInfo[mode] = _.uniqBy(appropriateInfo[mode], x => x.slug);
    } else if (phase) {
      mode = phase;
    }
  });

  return result;
}

/**
 * history:
 * [
 *  {
 *    "type": "message",
 *    "user": "U0DNBTXPX",
 *    "text": "summarize 1d",
 *    "ts": "1489030083.000042"
 *  }
 * ]
 *
 * members:
 * [
 *  {
 *    "id": "U0DNBTXPX",
 *    "team_id": "T036SEW08",
 *    "name": "xxxxxx",
 *  }
 * ]
 *
 * output:
 * [
 *  {
 *    "member": {},
 *    "issue": [{},{}],
 *    "done": [{},{}],
 *    "wip": [{},{}],
 *    "next": [{},{}],
 *  }
 * ]
 */
export function parse(history, members) {
  const emptyResult = createEmptyResult(members);
  return history.reduce((result, message) => {
    if (isStandupMessage(message)) return updateStandupResult(result, message);
    return result;
  }, emptyResult);
}

/**
 * standup:
 * [
 *  {
 *    "member": { name: xxxxx },
 *    "issue": ["",""],
 *    "done": ["wohoo",""],
 *    "wip": ["",""],
 *    "next": ["",""],
 *  }
 * ]
 *
 * output:
 *
 * *xxxxx*
 * > *Done*
 * > - wohoo
 */
function defaultLayout(standup) {
  const result = [];
  standup.forEach(({ member, ...status }) => {
    if (member.is_bot) return;
    if (_.every(status, _.isEmpty)) return;
    const phases = [ISSUE, DONE, WIP, NEXT];

    result.push(`*${member.name}*`);
    phases.forEach((phase) => {
      const actions = status[phase];
      if (_.isEmpty(actions)) return;
      result.push(`> *${_.startCase(phase)}*`);
      actions.forEach((action) => {
        result.push(`> - ${action.text}`);
      });
    });
  });

  if (!_.isEmpty(result)) {
    result.unshift('Here is the standup summary for today:');
  }

  return result.join('\n');
}

/**
 * standup:
 * [
 *  {
 *    "member": { name: xxxxx },
 *    "issue": ["",""],
 *    "done": ["wohoo",""],
 *    "wip": ["",""],
 *    "next": ["",""],
 *  }
 * ]
 *
 * output:
 *
 * <b>xxxxx</b>
 * <ul>
 *   <li>
 *     Done
 *     <ul>
 *       <li>wohoo</li>
 *     </ul>
 *   </li>
 * </ul>
 */
function htmlLayout(standup) {
  const result = [];
  standup.forEach(({member, ...status}) => {
    if (member.is_bot) return;
    if (_.every(status, _.isEmpty)) return;
    const phases = [ISSUE, DONE, WIP, NEXT];

    result.push(`<b>${member.name}</b>`);
    result.push('<ul>')
    phases.forEach((phase) => {
      const actions = status[phase];
      if (_.isEmpty(actions)) return;
      result.push('<li>')
      result.push(${_.startCase(phase)});
      result.push('<ul>')
      actions.forEach((action) => {
        result.push(`<li>${action.text}</li>`);
      });
      result.push('</ul>')
      result.push('</li>')
    });
    result.push('</ul>')
  });

  if (!_.isEmpty(result)) {
    result.unshift('Here is the standup summary for today:');
  }

  return result.join('\n');
}

export function summarizeStandup(history = [], members = [], layoutMode) {
  const parsedCoversation = parse(history, members);
  const layout = (layoutMode === 'html') ? htmlLayout : defaultLayout;
  return layout(parsedCoversation);
}
