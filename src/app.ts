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

app.event('app_mention', async ({ say }) => {
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
- リモートからオフィス出社に切り替えられた方はリストアップされません
- オフィス出社後にリモートに切り替えて未退勤の方はリストアップされてしまいます`);
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');
})();
