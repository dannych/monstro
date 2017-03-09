import _ from 'lodash';

const ISSUE = 'issue';
const DONE = 'done';
const NEXT = 'next';
const WIP = 'wip';

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

function updateStandupResult(result, message) {
  const appropriateInfo = result.find(info => info.member.id === message.user);
  const text = sanitizeText(message.text);

  let mode; let phase;
  text.split('\n').forEach((line) => {
    phase = isStandupPhase(line);
    if (mode && isStandupAction(line)) {
      appropriateInfo[mode].push(
        _.chain(line).trim(' -*_').value());
      appropriateInfo[mode] = _.uniq(appropriateInfo[mode]);
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
 *    "text": "<@U4F6Q1G1Y> summarize 1d",
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
 *    "issue": ["",""],
 *    "done": ["",""],
 *    "wip": ["",""],
 *    "next": ["",""],
 *  }
 * ]
 */
function parse(history, members) {
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
function layout(standup) {
  const result = [];
  standup.forEach(({ member, ...status }) => {
    if (member.is_bot) return;
    if (_.every(status, _.isEmpty)) return;

    const phases = [ISSUE, WIP, NEXT, DONE];
    result.push(`*${member.name}*`);
    phases.forEach((phase) => {
      const actions = status[phase];
      if (_.isEmpty(actions)) return;
      result.push(`> *${_.startCase(phase)}*`);
      actions.forEach((action) => {
        result.push(`> - ${_.capitalize(action)}`);
      });
    });
  });

  return result.join('\n');
}

export default function summarizeStandup(history, members) {
  const parsedCoversation = parse(history, members);
  return layout(parsedCoversation);
}
