const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const MainMenuData = require("../../data/main_menu.js")
const { Octokit } = require('@octokit/rest');




module.exports = {
  data: new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Announcement commands")
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("List all announcements")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("remove")
        .setDescription("List removes an announcement at a given position in the list. (First = 1)")
        .addIntegerOption(option =>
          option.setName("index")
            .setRequired(true)
            .setDescription("The index to add a new item (first = 1)")
        )
    )
    .addSubcommand(subcommand => subcommand
      .setName("add")
      .setDescription("Adds a new announcement at the given position in the list. (First = 1)")
      .addIntegerOption(option =>
        option.setName("index")
          .setRequired(true)
          .setDescription("The index to add a new item (first = 1)")
      )
          // .setRequired(true)
      .addStringOption(option =>
        option.setName("title")
          .setRequired(true)
          .setDescription("The title of the new announcement")
      )
          // .setRequired(true)
      .addStringOption(option =>
        option.setName("date")
          .setRequired(true)
          .setDescription("The date of the new annoncement")
      )
          // .setRequired(true)
      .addStringOption(option =>
        option.setName("description")
          .setRequired(true)
          .setDescription("The description of the new annoncement")
      )
          // .setRequired(true)
      .addStringOption(option =>
        option.setName("link")
          .setRequired(true)
          .setDescription("The link of the new annoncement")
      )
    )
        ,
      
  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      await handleListCommand(client, interaction);
    }

    if (subcommand === "add") {
      await handleSetCommand(client, interaction)
    }
  }
}

async function handleListCommand(client, interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xc297db)
    .setTitle("Announcements:")
    .setURL("https://github.com/PartlySaneStudios/partly-sane-skies-public-data/blob/main/data/main_menu.json")
  const announcements = await MainMenuData.getAnnouncements();

  for (let i = 1; i <= announcements.length; i++) {
    let announcement = announcements[i - 1];
    let field = ""
    field += `Title: \`\`\`${announcement.name}\`\`\`\n`
    field += `Date: \`\`\`${announcement.date}\`\`\`\n`
    field += `Description: \`\`\`${announcement.description}\`\`\`\n`
    field += `[Link:](${announcement.link}) \`\`\`${announcement.link}\`\`\``

    embed.addFields({ name: `${i}: `, value: field })
  }

  await interaction.reply({ embeds: [embed] });
}

const AnnouncementPrototype = {
  name: "",
  date: "",
  description: "",
  link: "",
}
async function handleSetCommand(client, interaction) {
  await interaction.reply("Loading...")
  
  await interaction.editReply("Requesting data...")
  const fullData = await MainMenuData.getMainMenuJson()
  const sha = await MainMenuData.getSHA()
  let announcements = await MainMenuData.getAnnouncements()

  const parameters = interaction.options

  await interaction.editReply("Creating new announcment...")
  let newAnnouncement = Object.create(AnnouncementPrototype)
  newAnnouncement.name = parameters.get("title").value
  newAnnouncement.date = parameters.get("date").value
  newAnnouncement.description = parameters.get("description").value
  newAnnouncement.link = parameters.get("link").value
  announcements.splice(parameters.get("index").value - 1, 0, newAnnouncement)
  

  console.log(fullData)
  fullData.announcements = announcements

  await interaction.editReply("Sending new announcement...")

  const config = require("../../config/config.json")
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  
  try {
    await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
      owner: owner,
      repo: repo,
      path: path,
      message: `Updated announcements (${parameters.get("title").value})`,
      committer: {
        name: `Su386's Bot (@${interaction.member.user.tag} through discord)`,
        email: `153068057+Su286@users.noreply.github.com`
      },
      content:  Buffer.from(JSON.stringify(fullData, null, 4)).toString("base64"),
      sha: sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    await interaction.editReply(`Sucessfully updated announcements (${parameters.get("title").value})!`)
  } catch(requestError) {
    console.error(requestError)
    interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(requestError.response, null, 4)}\`\`||`)
  }
}



async function handleRemoveCommand(client, interaction) {
  await interaction.reply("Loading...")
  
  await interaction.editReply("Requesting data...")
  const fullData = await MainMenuData.getMainMenuJson()
  const sha = await MainMenuData.getSHA()
  let announcements = await MainMenuData.getAnnouncements()

  const parameters = interaction.options

  await interaction.editReply("Creating new announcment...")
  let newAnnouncement = Object.create(AnnouncementPrototype)
  newAnnouncement.name = parameters.get("title").value
  newAnnouncement.date = parameters.get("date").value
  newAnnouncement.description = parameters.get("description").value
  newAnnouncement.link = parameters.get("link").value
  announcements.splice(parameters.get("index").value - 1, 0, newAnnouncement)
  

  console.log(fullData)
  fullData.announcements = announcements

  await interaction.editReply("Sending new announcement...")

  const config = require("../../config/config.json")
  const owner = config.data.user;
  const repo = config.data.repo;
  const path = 'data/main_menu.json';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })
  
  try {
    await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}`, {
      owner: owner,
      repo: repo,
      path: path,
      message: `Updated announcements (${parameters.get("title").value})`,
      committer: {
        name: `Su386's Bot (@${interaction.member.user.tag} through discord)`,
        email: `153068057+Su286@users.noreply.github.com`
      },
      content:  Buffer.from(JSON.stringify(fullData, null, 4)).toString("base64"),
      sha: sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    await interaction.editReply(`Sucessfully updated announcements (${parameters.get("title").value})!`)
  } catch(requestError) {
    console.error(requestError)
    interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(requestError.response, null, 4)}\`\`||`)
  }
}
