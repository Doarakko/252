import dotenv from 'dotenv';
import { App, LogLevel } from '@slack/bolt';
import * as attendance from './attendance';

dotenv.config();

const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  logLevel: LogLevel.WARN,
  convoStore: false,
  ignoreSelf: true
});

const r = new RegExp(
  `${process.env.SLACK_OUT_OFFICE_MESSAGE}|${process.env.SLACK_OUT_HOME_MESSAGE}`
);

app.message(r, async ({ say }) => {
  const workingUsers = await attendance.listWorkingUsersById();

  // do nothing if already notified
  if (workingUsers.get('252')) {
    return;
  }

  let userId = '';
  let count = 0;
  workingUsers.forEach((value, key) => {
    if (!value) {
      userId = key;
      count++;
    }
  });

  if (count === 1) {
    await say(`<@${userId}>
お仕事お疲れ様です、オフィスにいる最後の生存者です:firefighter:
戸締まりよろしくお願いします:lock:

【注意事項】
- <#${process.env.SLACK_CHANNEL_ID}>のメッセージを元にチェックしています
- リモートからオフィス出社に切り替えられた方がオフィスに残っている可能性があります。戸締まりの際はご注意ください
- オフィス出社後にリモートに切り替えて未退勤の方にメンションが飛ぶ可能性があります。ご容赦ください`);
  }
});

app.event('app_mention', async ({ event, say }) => {
  console.log(event);

  const workingUsers = await attendance.listWorkingUsersById();
  const usernamesById = await attendance.listUsernamesById();

  let usernames = '';
  let count = 0;
  workingUsers.forEach((value, key) => {
    if (!value) {
      usernames += `- ${usernamesById.get(key)}\n`;
      count++;
    }
  });

  const message =
    count === 0
      ? 'オフィスに生存者はいません、お気を付けてお帰りください:wave:\n'
      : `オフィスに *${count}名* の生存者を確認しました、救出してください:fire_engine:\n

【:rotating_light:生存者:rotating_light:】
${usernames}`;

  await say(` _ *オフィス内生存者確認ボットです_ * :firefighter:
${message}

【注意事項】
- <#${process.env.SLACK_CHANNEL_ID}>のメッセージを元にチェックしています
- リモートからオフィス出社に切り替えた方がオフィスに残っている可能性があります。リストアップはされないためご注意ください
- オフィス出社後にリモートに切り替えて未退勤の方もリストアップされてしまいます。ご容赦ください`);
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
