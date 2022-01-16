# 252

Slack bot that lists people who are still in the office and working using attendance log in Slack channel.

Prevents the office from being locked when someone is in the office.

![attendance](attendance.png)

![252](252.png)

## Requirements

- Node.js
- Slack
- Heroku

## Usage

### 1. Create Slack App using `manifest.yml`

### 2. make `.env`

```sh
cp .env.example .env
```

Enter your environment variables to `.env`.

```txt
SLACK_APP_TOKEN=xapp-aaaa
SLACK_BOT_TOKEN=xoxb-bbbb
SLACK_CHANNEL_ID=CCCCCCCC
SLACK_IN_OFFICE_MESSAGE=:in_office:
SLACK_OUT_OFFICE_MESSAGE=:out_office:
SLACK_IN_HOME_MESSAGE=:in_home:
SLACK_OUT_HOME_MESSAGE=:out_home:
```

### 3. Run

```sh
npm run dev
```

## Run on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
