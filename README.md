# Sanity
A discord bot to help assist with Partly Sane Skies

## How to use
Install a [NodeJS Version newer than 16.11.0](https://nodejs.org/en), using the LTS of 10.10.0 is best.
After installing, clone this repo.
In the folder of this repo, run "npm install" in the command prompt to install the given dependencies.
It will take a bit, after it's done, run "node ." or "node .\main.js" to start the bot

## Setting Up the Bot
Currently, the .env only needs the Bot Token
To get the Token, head to the [Developer Portal](https://discord.com/developers/applications), create a "New Application", give it an appropriate name and press "Create".
While we are on the "General Information" Tab, copy the APPLICATION ID into your clipboard. (Having clipboard history enabled is best)
Now head to the "Bot" Tab, and press "Reset Token". You might need to enter your Auth Token.
The Token is now visible, press the copy button.
In the "Bot" Tab, scroll down to the "Privileged Gateway Intents" and enable "Presence Intent", "Server Members Intent" & "Message Content Intent". If you dont do that, the bot won't start.
In the project, create a file called ".env", open that file, and add the line "TOKEN=your_token", with your copied token replacing the "your_token" (You dont need Quotation marks)

In the .env file, you'll also need a GITHUB_TOKEN with repo access, for that, open [Developer Settings](https://github.com/settings/tokens) and click on "Tokens (classic)". There, generate a new token (classic) with the repo scope. You will need this token to work with the Github API for `announcement.js`. Paste this generated token into your .env file in a new line "GITHUB_TOKEN=your_token", with the copied token replacing the "your_token" (You don't need Quotation marks)

To invite your Bot, head to [Permission Calculator](discordapi.com/permissions.html) and copy your APPLICATION ID into the "Client ID" line.
Now select the fitting permissions (Administrator should do just fine) and then click the link at the bottom.
Now do the normal discord invite thing and Boom, you're done. Yay
Time to code!