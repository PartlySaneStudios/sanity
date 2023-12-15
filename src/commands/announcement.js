//
// Written by Su386'and J10a1n15.
// See LICENSE for copyright and license notices.
//


const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const MainMenuData = require("../data/main_menu.js");
const SystemUtils = require("../utils/SystemUtils.js");
const config = require("../config/config.json");

// Announcement data structure
const AnnouncementPrototype = {
  name: "",
  date: "",
  description: "",
  link: "",
}

const subcommands = {
  list: { name: "list", function: handleListCommand },
  add: { name: "add", function: handleSetCommand },
  remove: { name: "remove", function: handleRemoveCommand },
  autoadd: { name: "autoadd", function: handleAutoAdd },
}

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
          option
            .setName("index")
            .setRequired(true)
            .setDescription("The index to add a new item (first = 1)")
        )
    )
    .addSubcommand(subcommand => subcommand
      .setName("add") // Creates add subcommand
      .setDescription("Adds announcement, shifts positions. Former 1 becomes 2. (First = 1)")
      .addIntegerOption(option =>
        option
          .setName("index")
          .setRequired(true)
          .setDescription("The index to add a new item (first = 1)")
      )
      .addStringOption(option =>
        option
          .setName("title")
          .setRequired(true)
          .setDescription("The title of the new announcement")
      )
      .addStringOption(option =>
        option
          .setName("date")
          .setRequired(true)
          .setDescription("The date of the new annoncement")
      )
      .addStringOption(option =>
        option
          .setName("description")
          .setRequired(true)
          .setDescription("The description of the new annoncement")
      )
      .addStringOption(option =>
        option
          .setName("link")
          .setRequired(true)
          .setDescription("The link of the new annoncement")
      )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("autoadd")
        .setDescription("Adds announcement from URL, shifts positions. Former 1 becomes 2. (First = 1)")
        .addIntegerOption(option =>
          option
            .setName("index")
            .setRequired(true)
            .setDescription("The index to add a new item (first = 1)")
        )
        .addStringOption(option =>
          option
            .setName("url")
            .setRequired(true)
            .setDescription("The URL of the new announcement")
        )
        .addStringOption(option =>
          option
            .setName("date")
            .setRequired(true)
            .setDescription("The date of the new annoncement")
        )
    ),

  async run(client, interaction) {
    // Gets the subcommand
    const subcommand = interaction.options.getSubcommand();

    const subcommandObject = subcommands[subcommand]

    if (subcommandObject) {
      await subcommandObject.function(client, interaction)
    }
  }
}

async function handleListCommand(client, interaction) {
  // Creates new embed
  const embed = new EmbedBuilder()
    .setColor(config.color)
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

async function handleSetCommand(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")


  await interaction.editReply("Requesting data...")
  // Gets all the required portions of data
  let fullJson = {}
  let announcements = {}
  let sha = ""
  try {
    const mainMenuData = await MainMenuData.getMainMenuData()

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

  await SystemUtils.sendRequest("data/main_menu.json",
    `Added announcement at index ${parameters.get("index").value} (${parameters.get("title").value})`,
    interaction.member.user.tag,
    fullJson,
    sha
  ).then(response => {
    console.log(response)
    const [data, error] = response; // destructuring response array
    if (error) {
      interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(error.response, null, 4)}\`\`||`)
      console.error('Error making GitHub API request:', error);
      return
    }

    interaction.editReply(`[Sucessfully added announcement at index ${parameters.get("index").value} (${parameters.get("title").value})](${data.data.commit?.html_url})!`)
  })
}



async function handleRemoveCommand(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")

  // Gets necessary data
  await interaction.editReply("Requesting data...")
  let fullJson = {}
  let announcements = {}
  let sha = ""
  try {
    const mainMenuData = await MainMenuData.getMainMenuData()

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

  await SystemUtils.sendRequest("data/main_menu.json",
    `Removed 1 announcement at index ${parameters.get("index").value} (${titleToRemove})`,
    interaction.member.user.tag,
    fullJson,
    sha
  ).then(async response => {
    const [data, error] = response; // destructuring response array
    if (error) {
      interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(error.response, null, 4)}\`\`||`)
      console.error('Error making GitHub API request:', error);
      return
    }

    interaction.editReply(`[Sucessfully removed announcement at index ${parameters.get("index").value} (${titleToRemove})](${data.data.commit?.html_url})!`)
  })
}

async function handleAutoAdd(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")

  // Gets necessary data
  await interaction.editReply("Requesting data...")
  let fullJson = {}
  let announcements = {}
  let sha = ""
  try {
    const mainMenuData = await MainMenuData.getMainMenuData()

    sha = mainMenuData.sha
    fullJson = mainMenuData.json
    announcements = fullJson.announcements
  } catch (error) {
    console.error('Error getting GitHub API data:', error);
    interaction.followUp(`Error getting GitHub API data:\n\n||\`\`${JSON.stringify(error)}\`\`||`)
    return
  }

  // Gets the parameters object
  const parameters = interaction.options
  await SystemUtils.getUrlContent(parameters.get("url").value)
    .then((htmlCode) => {
      if (htmlCode !== null) {
        let newAnnouncement = Object.create(AnnouncementPrototype)

        newAnnouncement.name = SystemUtils.getElementFromHtml(htmlCode, "h1.p-title-value")
        newAnnouncement.date = interaction.options.get("date").value
        newAnnouncement.description = SystemUtils.getElementFromHtml(htmlCode, "div.bbWrapper").split("\n").slice(0, 2).join(" ")
        newAnnouncement.link = parameters.get("url").value

        // Checks for valid index
        index = parameters.get("index").value - 1
        if (index >= 0 && index < announcements.length) {
          announcements.splice(index, 0, newAnnouncement)
        } else {
          interaction.followUp(`Error Updating file: Invalid Index (${index})`)
          return
        }

        const embed = new EmbedBuilder()
          .setColor(config.color)
          .setTitle("New Announcement:")
          .setDescription("Does this look right?\n\nIf so, click the checkmark below to confirm, otherwise, click the X to cancel.")
          .setURL(`https://github.com/${config.data.user}/${config.data.repo}/blob/main/data/main_menu.json`)
          .addFields({ name: `${index + 1}: `, value: `Title: \`\`\`${newAnnouncement.name}\`\`\`\nDate: \`\`\`${newAnnouncement.date}\`\`\`\nDescription: \`\`\`${newAnnouncement.description}\`\`\`\n[Link:](${newAnnouncement.link}) \`\`\`${newAnnouncement.link}\`\`\`` })

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('confirm')
              .setLabel('Confirm')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('cancel')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Danger),
          );

        interaction.editReply({ embeds: [embed], components: [row] }).then(async response => {
          const collectorFilter = i => i.user.id === interaction.user.id;

          const collector = response.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

          collector.on("collect", async i => {
            if (i.customId === "confirm") {
              await i.update({ embeds: [embed], components: [] })
              // Updates the json to have annoucnements
              fullJson.announcements = announcements

              SystemUtils.sendRequest("data/main_menu.json",
                `Added announcement at index ${parameters.get("index").value} (${newAnnouncement.name})`,
                interaction.member.user.tag,
                fullJson,
                sha
              ).then(response => {
                const [data, error] = response; // destructuring response array
                if (error) {
                  interaction.followUp(`Error updating repository:\n\n||\`\`${JSON.stringify(error.response, null, 4)}\`\`||`)
                  console.error('Error making GitHub API request:', error);
                  return
                }

                interaction.editReply(`[Sucessfully added announcement at index ${parameters.get("index").value} (${newAnnouncement.name})](${data.data.commit?.html_url})!`)
              })
              collector.stop("confirm")

            } else if (i.customId === "cancel") {
              await i.update({ embeds: [], components: [], content: "Cancelled" })
              collector.stop("cancel")
            }
          })
        })
      }
    })
}