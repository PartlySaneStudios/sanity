# Sanity
Welcome to Sanity! This bot is designed to assist our interactions within the Partly Sane Skies Development Team.

## How to use
1. **NodeJS Installation:** Ensure you have [NodeJS](https://nodejs.org/en) installed, preferably version 16.11.0 or newer. The LTS version of 20.10.0 is recommended.
2. **Clone Repository:** Clone this repository to your local machine.
3. **Dependency Installation:** In the repository folder, run `npm start` in the command prompt. This will install the necessary dependencies. After completion, the bot will launch using `node main.js`.

## Setting Up the .env
Currently, the `.env` file needs 6 elements: `TOKEN`, `GITHUB_TOKEN`, `OWNER`, `REPO`, `SERVER_URL`, `SERVER_STATUS_CHANNEL_ID` & `DAILY_FUNFACT_CHANNEL_ID`

### Obtaining Bot Token
Follow these steps to obtain the Bot Token:

1. Head to the [Developer Portal](https://discord.com/developers/applications).
2. Create a new application, copy the APPLICATION ID.
3. In the "Bot" tab, reset the token and copy it.
4. Enable "Presence Intent," "Server Members Intent," & "Message Content Intent."
5. In your project, create a .env file, add TOKEN=your_token (replace with your token).

### Obtaining Github Token
For GitHub API access in `announcement.js` and `mods.js`:
1. Open [Developer Settings](https://github.com/settings/tokens).
2. Generate a new token with the repo scope.
3. Copy the generated token.
4. In `.env`, add `GITHUB_TOKEN=your_token`.

### Repository Structure
Ensure your repository aligns with the specified structure for mods.json and main_menu.json. Examples can be found [here](https://github.com/PartlySaneStudios/partly-sane-skies-public-data/blob/main/info.md).

Add two more lines to your `.env` file:
- `OWNER=your_github_username`
- `REPO=your_repository_name`

### Partly Sane Cloud Integration
If using Partly Sane Cloud, include `SERVER_URL`, `SERVER_STATUS_CHANNEL_ID` and `DAILY_FUNFACT_CHANNEL_ID` properties in your `.env`.


Now your .env file should look like this:
```env
TOKEN=your_bot_token
GITHUB_TOKEN=your_github_token
OWNER=your_user_name
REPO=your_repo
SERVER_URL=server_url
SERVER_STATUS_CHANNEL_ID=channel_id
DAILY_FUNFACT_CHANNEL_ID=channel_id
```

## Inviting the Bot
1. Visit the [Permission Calculator](discordapi.com/permissions.html)
2. Copy your APPLICATION ID into "Client ID."
3. Select appropriate permissions (Administrator is recommended).
4. Click the generated link, follow the Discord invite process, and voilà, you can use the bot now!
