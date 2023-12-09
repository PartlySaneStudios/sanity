//
// Written by Su386'and J10a1n15.
// See LICENSE for copyright and license notices.
//


const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const MainMenuData = require("../../data/main_menu.js")
const { Octokit } = require('@octokit/rest');


const config = require("../../config/config.json")


module.exports = {
  data: new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Announcement commands")
    .addSubcommand(subcommand => // Creates list subcommand
      subcommand
        .setName("list")
        .setDescription("List all announcements")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("remove") // Creates remove subcommand
        .setDescription("List removes an announcement at a given position in the list. (First = 1)")
        .addIntegerOption(option =>
          option.setName("index")
            .setRequired(true)
            .setDescription("The index to add a new item (first = 1)")
        )
    )
    .addSubcommand(subcommand => subcommand
      .setName("add") // Creates add subcommand
      .setDescription("Adds a new announcement at the given position in the list. The former announcement 1 becomes 2. (First = 1)")
      .addIntegerOption(option =>
        option.setName("index") 
          .setRequired(true)
          .setDescription("The index to add a new item (first = 1)")
      )
      .addStringOption(option =>
        option.setName("title")
          .setRequired(true)
          .setDescription("The title of the new announcement")
      )
      .addStringOption(option =>
        option.setName("date")
          .setRequired(true)
          .setDescription("The date of the new annoncement")
      )
      .addStringOption(option =>
        option.setName("description")
          .setRequired(true)
          .setDescription("The description of the new annoncement")
      )
      .addStringOption(option =>
        option.setName("link")
          .setRequired(true)
          .setDescription("The link of the new annoncement")
      )
    ),

  async run(client, interaction) {
    // Gets the subcommand
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") { // Handles list subcommand
      await handleListCommand(client, interaction);
    }

    if (subcommand === "add") { // Handles add subcommand
      await handleSetCommand(client, interaction)
    }

    if (subcommand === "remove") { // Handles remove subcommand
      await handleRemoveCommand(client, interaction)
    }
  }
}

async function handleListCommand(client, interaction) {
  // Creates new embed
  const embed = new EmbedBuilder()
    .setColor(0xc297db)
    .setTitle("Announcements:")
    .setURL(`https://github.com/${config.data.user}/${config.data.repo}/blob/main/data/main_menu.json`)

    // Get's announcement data
  const announcements = await MainMenuData.getAnnouncements();

  // Creates a new field per announcement
  for (let i = 1; i <= announcements.length; i++) {
    let announcement = announcements[i - 1];
    let field = ""
    field += `Title: \`\`\`${announcement.name}\`\`\`\n`
    field += `Date: \`\`\`${announcement.date}\`\`\`\n`
    field += `Description: \`\`\`${announcement.description}\`\`\`\n`
    field += `[Link:](${announcement.link}) \`\`\`${announcement.link}\`\`\``

    embed.addFields({ name: `${i}: `, value: field })
  }

  // Responds with the embed
  await interaction.reply({ embeds: [embed] });
}

// Announcement data structure
const AnnouncementPrototype = {
  name: "",
  date: "",
  description: "",
  link: "",
}
async function handleSetCommand(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")


  await interaction.editReply("Requesting data...")
  // Gets all the required portions of data
  let fullJson = ""
  let sha = ""
  let announcements = ""
  try {
    mainMenuData = await MainMenuData.getMainMenuData()

    sha = mainMenuData.sha
    fullJson = mainMenuData.json
    announcements = fullJson.announcements
  } catch (error) {
    // Handle errors
    console.error('Error getting GitHub API data:', error);
    interaction.followUp(`Error getting GitHub API data:\n\n||\`\`${JSON.stringify(error)}\`\`||`)
    return
  }
  
  // Gets the parameters
  const parameters = interaction.options

  await interaction.editReply("Creating new announcment...")
  // Creates a new annoucenment with the new parameters
  let newAnnouncement = Object.create(AnnouncementPrototype)
  newAnnouncement.name = parameters.get("title").value
  newAnnouncement.date = parameters.get("date").value
  newAnnouncement.description = parameters.get("description").value
  newAnnouncement.link = parameters.get("link").value

  // Checks for valid index
  index = parameters.get("index").value - 1
  if (index >= 0 && index < announcements.length) {
    announcements.splice(index, 0, newAnnouncement)
  } else {
    interaction.followUp(`Error Updating file: Invalid Index (${index})`)
    return
  }
  
  // Updates the json to have annoucnements
  fullJson.announcements = announcements


  await interaction.editReply("Sending new announcement...")

  // Creates a new octokit request with the new json
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  

  await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
    owner: owner,
    repo: repo,
    path: path,
    message: `Added announcement at index ${parameters.get("index").value}(${parameters.get("title").value})`, // Commit title
    committer: { // Commit information
      name: `Su386's Bot (@${interaction.member.user.tag} through discord)`,
      email: `153068057+Su286@users.noreply.github.com`
    },
    content:  Buffer.from(JSON.stringify(fullJson, null, 4)).toString("base64"), // Converts the json to base64
    sha: sha,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  .then(response => {
    // Handle the response object
    interaction.editReply(`[Sucessfully added announcement at index ${parameters.get("index").value} (${parameters.get("title").value})](${response.data.commit?.html_url})!`)
  })
  .catch(error => {
    // Handle errors
    interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(error.response, null, 4)}\`\`||`)
    console.error('Error making GitHub API request:', error);
  });
}



async function handleRemoveCommand(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")
  
  // Gets necessary data
  await interaction.editReply("Requesting data...")
  let fullJson = ""
  let sha = ""
  let announcements = ""
  try {
    mainMenuData = await MainMenuData.getMainMenuData()

    sha = mainMenuData.sha
    fullJson = mainMenuData.json
    console.log(fullJson)
    announcements = fullJson.announcements
  } catch (error) {
    console.error('Error getting GitHub API data:', error);
    // console.error(`${error.response}`)
    interaction.followUp(`Error getting GitHub API data:\n\n||\`\`${JSON.stringify(error)}\`\`||`)
    return
  }
  
  // Gets the parameters object
  const parameters = interaction.options


  await interaction.editReply("Removing announcement")
  let titleToRemove = "None"
  // Checks for valid index
  const index = parameters.get("index").value - 1
  if (index >= 0 && index < announcements.length) {
    titleToRemove = announcements[index].name
    announcements.splice(index, 1);
  } else {
    interaction.followUp(`Error Updating file: Invalid Index (${index})`)
    return
  }
  
  // Updates fullJson
  fullJson.announcements = announcements

  await interaction.editReply("Sending data...")

  // Creates a request to send to github
  const config = require("../../config/config.json")
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  

  await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
    owner: owner,
    repo: repo,
    path: path,
    message: `Removed 1 announcement at index ${parameters.get("index").value} (${titleToRemove})`, // Commit title
    committer: { // Commit info
      name: `Su386's Bot (@${interaction.member.user.tag} through discord)`,
      email: `153068057+Su286@users.noreply.github.com`
    },
    content:  Buffer.from(JSON.stringify(fullJson, null, 4)).toString("base64"), // Commit content
    sha: sha,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  .then(response => {
    // Handle the response object
    interaction.editReply(`[Sucessfully removed 1 announcement at index ${parameters.get("index").value} (${titleToRemove})](${response.data.commit?.html_url})!`)
  })
  .catch(error => {
    // Handle errors
    console.error('Error making GitHub API request:', error);
    interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(error.response, null, 4)}\`\`||`)
  });

}
