# Sanity
A discord bot to help assist with Partly Sane Skies

## How to use
Install a [NodeJS Version newer than 16.11.0](https://nodejs.org/en), using the LTS of 20.10.0 is best.
After installing, clone this repo.
In the folder of this repo, run `npm start` in the command prompt to install the given dependencies.
It will take a bit, after it's done, it will automatically run `node main.js` to start the bot

## Setting Up the .env
Currently, the .env file needs 4 elements: TOKEN, GITHUB_TOKEN, USER & REPO

To obtain the Bot Token, follow these steps:
1. Head to the [Developer Portal](https://discord.com/developers/applications).
2. Create a "New Application" with an appropriate name and press "Create".
3. Copy the APPLICATION ID from the "General Information" Tab.
4. Navigate to the "Bot" Tab, press "Reset Token" (you may need to enter your Auth Token).
5. Copy the Token that is now visible.
6. In the "Bot" Tab, scroll down to "Privileged Gateway Intents" and enable "Presence Intent," "Server Members Intent," & "Message Content Intent" for the bot to start.
7. In your project, create a file named ".env," open it, and add the line "TOKEN=your_token," replacing "your_token" with your copied token (without quotation marks).

Additionally, for working with the Github API in `announcement.js`, you'll need a GITHUB_TOKEN with repo access:
1. Open [Developer Settings](https://github.com/settings/tokens).
2. Click on "Tokens (classic)" and generate a new token with the repo scope.
3. Copy the generated token.
4. In your .env file, add a new line "GITHUB_TOKEN=your_token", replacing "your_token" with the copied token (without quotation marks).

Finally, add two more lines to your .env file:
- "OWNER=j10a1n15" (replace with your desired GitHub username)
- "REPO=partly-sane-skies-public-data" (replace with the name of your GitHub repository)

Now your .env file should look like this:
```env
TOKEN=your_bot_token
GITHUB_TOKEN=your_github_token
OWNER=your_user_name
REPO=your_repo
```

## Inviting the Bot
To invite your Bot, head to [Permission Calculator](discordapi.com/permissions.html) and copy your APPLICATION ID into the "Client ID" line.
Now select the fitting permissions (Administrator should do just fine) and then click the link at the bottom.
Now do the normal discord invite thing and Boom, you're done. Yay
Time to code!
