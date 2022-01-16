import dotenv from 'dotenv';
import moment from 'moment-timezone';
import { WebClient } from '@slack/web-api';

dotenv.config();

const TOKEN = process.env.SLACK_BOT_TOKEN || '';
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID || '';

const IN_OFFICE_MESSAGE = process.env.SLACK_IN_OFFICE_MESSAGE || '';
const OUT_OFFICE_MESSAGE = process.env.SLACK_OUT_OFFICE_MESSAGE || '';
// const IN_HOME_MESSAGE = process.env.SLACK_IN_HOME_MESSAGE || '';
const OUT_HOME_MESSAGE = process.env.SLACK_OUT_HOME_MESSAGE || '';

const web = new WebClient(TOKEN);

export async function listWorkingUsersById(): Promise<Map<string, boolean>> {
  try {
    const now = moment().tz('Asia/Tokyo');
    const oldest = moment()
      .tz('Asia/Tokyo')
      .set('hour', 5)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0);
    const latest = moment()
      .tz('Asia/Tokyo')
      .set('hour', 4)
      .set('minute', 59)
      .set('second', 59)
      .set('millisecond', 59);

    // consider working across days
    if (now.hour() >= 0 && now.hour() < 5) {
      oldest.set('day', now.day() - 1);
    } else {
      latest.set('day', now.day() + 1);
    }

    const m = new Map<string, boolean>();
    let hasMore = true;
    let nextCursor = '';
    while (hasMore) {
      const res = await web.conversations.history({
        channel: CHANNEL_ID,
        limit: 200,
        latest: latest.unix().toString(),
        oldest: oldest.unix().toString(),
        cursor: nextCursor
      });
      nextCursor = res.response_metadata?.next_cursor || '';
      hasMore = res.has_more || false;

      const messages = res.messages || [];
      for (let i = 0; i < messages.length; i++) {
        const body = messages[i].text || '';
        const userId = messages[i].user || '';

        // exclude users who have left the office
        if (body.indexOf(IN_OFFICE_MESSAGE) != -1 && !m.has(userId)) {
          m.set(userId, false);
        } else if (
          body.indexOf(OUT_OFFICE_MESSAGE) != -1 ||
          body.indexOf(OUT_HOME_MESSAGE) != -1
        ) {
          m.set(userId, true);
        }
      }
    }

    return m;
  } catch (error) {
    console.log(error);
    throw Error('failed to list videos');
  }
}

export async function listUsernamesById(): Promise<Map<string, string>> {
  try {
    const m = new Map<string, string>();
    let hasMore = true;
    let nextCursor = '';

    while (hasMore) {
      const res = await web.users.list({
        limit: 200,
        cursor: nextCursor
      });
      nextCursor = res.response_metadata?.next_cursor || '';
      hasMore = nextCursor !== '';

      const members = res.members || [];
      for (let i = 0; i < members.length; i++) {
        const userId = members[i].id || '';
        const realName = members[i].real_name || '';
        m.set(userId, realName);
      }
    }

    return m;
  } catch (error) {
    console.log(error);
    throw Error('failed to list usernames by id');
  }
}
