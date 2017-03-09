export const STANDUP_CHANNEL_ID = 'G0J4T7RKM';

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
 * results:
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
function parse() {

}

export function summarizeStandup(history, members) {
  try {
    return parse(history, members);
  } catch (e) {
    return `Encounter this error: ${e}`;
  }
}
