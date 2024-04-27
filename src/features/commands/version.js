//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const MainMenuData = require("../../data/main_menu.js");
const SystemUtils = require("../../utils/SystemUtils.js");
const config = require("../../config/config.json")
const SystemUtils = require("../../utils/SystemUtils")

const subcommands = {
  get: { name: "get", function: handleGetCommand, permission: false },
  update: { name: "update", function: handleUpdateCommand, permission: true },
  bupdate: { name: "bupdate", function: handleBetaUpdateCommand, permission: true },
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("Manage the version of the mod")
    .addSubcommand(subcommand => subcommand
      .setName("get")
      .setDescription("Gets the current version of the mod")
    )
    .addSubcommand(subcommand => subcommand
      .setName("bupdate")
      .setDescription("Updates the mod to a new **BETA** version")
      .addStringOption(option => option
        .setName("version")
        .setRequired(true)
        .setDescription("The version to update to")
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName("update")
      .setDescription("Updates the mod to a new version")
      .addStringOption(option => option
        .setName("version")
        .setRequired(true)
        .setDescription("The version to update to")
      )
    ),

  async run(client, interaction) {
    // Gets the subcommand
    const subcommand = interaction.options.getSubcommand();

    const subcommandObject = subcommands[subcommand]

    if (subcommandObject) {
      // Checks for permission
      if (subcommandObject.permission && !config.allowedAnnouncementUsers.includes(interaction.member.id))
        return interaction.reply(`You do not have permission to use this command!`)

      // Runs the subcommand
      try {
        await subcommandObject.function(client, interaction)
      } catch (e) {
        console.error(e)
        try {
          await interaction.followUp("Failed to run command!")
        } catch {
          await interaction.reply("Failed to run command!")
        }
      }
    }
  }
}

async function handleGetCommand(client, interaction) {
  const version = await MainMenuData.getVersion()
  const betaVersion = await MainMenuData.getBetaVersion()

  const latestVersion = version.latest_version.replace("beta", "Beta")
  const latestBetaVersion = betaVersion.latest_version.replace("beta", "Beta").replace("prerelease", "Pre-release")

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle("Version:")

  if (latestVersion === latestBetaVersion) {
    embed.addFields({
      name: "Latest Version:",
      value: `${latestVersion}, on ${version.latest_version_release_date}`
    })
  } else {
    embed.addFields({
      name: "Latest Version:",
      value: `${latestVersion}, on ${version.latest_version_release_date}`
    }, {
      name: "Latest Beta Version:",
      value: `${latestBetaVersion}, on ${betaVersion.latest_version_release_date}`
    })
  }

  await interaction.reply({ embeds: [embed] })
}

async function handleUpdateCommand(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")

  await interaction.editReply("Requesting data...")

  // Gets all the required portions of data
  let fullJson = {}
  let sha = ""
  try {
    const mainMenuData = await MainMenuData.getMainMenuData()

    sha = mainMenuData.sha
    fullJson = mainMenuData.json
  } catch (error) {
    // Handle errors
    console.error('Error getting GitHub API data:', error);
    interaction.followUp(`Error getting GitHub API data:\n\n||\`\`${JSON.stringify(error)}\`\`||`)
    return
  }


  const versionPrototype = {
    ...fullJson.mod_info,
    latest_version: interaction.options.getString("version"),
    latest_version_release_date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
  }

  const betaVersionPrototype = {
    ...fullJson.prerelease_channel,
    latest_version: interaction.options.getString("version"),
    latest_version_release_date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
  }

  fullJson.mod_info = versionPrototype
  fullJson.prerelease_channel = betaVersionPrototype

  await interaction.editReply("Sending new mod version...")

  await SystemUtils.sendCommitRequest("data/main_menu.json",
    `Added version ${versionPrototype.latest_version} (${versionPrototype.latest_version_release_date})`,
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

    const pscResetResponse = await (await SystemUtils.requestPSC(`/v1/pss/middlemanagement/resetpublicdata?key=${process.env.CLEAR_CACHE_KEY}`, interaction.member.user.tag)).text()

    interaction.editReply(`[Version ${versionPrototype.latest_version} (${versionPrototype.latest_version_release_date}) has been added to the mod!\nView the commit here.](${data.data.commit?.html_url})!\n*${pscResetResponse}*`)
  })
}

async function handleBetaUpdateCommand(client, interaction) {
  // Creates an initial reply 
  await interaction.reply("Loading...")

  await interaction.editReply("Requesting data...")

  // Gets all the required portions of data
  let fullJson = {}
  let sha = ""
  try {
    const mainMenuData = await MainMenuData.getMainMenuData()

    sha = mainMenuData.sha
    fullJson = mainMenuData.json
  } catch (error) {
    // Handle errors
    console.error('Error getting GitHub API data:', error);
    interaction.followUp(`Error getting GitHub API data:\n\n||\`\`${JSON.stringify(error)}\`\`||`)
    return
  }

  const betaVersionPrototype = {
    ...fullJson.prerelease_channel,
    latest_version: interaction.options.getString("version"),
    latest_version_release_date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }),
  }

  fullJson.prerelease_channel = betaVersionPrototype

  await interaction.editReply("Sending new mod version...")

  await SystemUtils.sendCommitRequest("data/main_menu.json",
    `Added version ${betaVersionPrototype.latest_version} (${betaVersionPrototype.latest_version_release_date})`,
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

    const pscResetResponse = await (await SystemUtils.requestPSC(`/v1/pss/middlemanagement/resetpublicdata?key=${process.env.CLEAR_CACHE_KEY}`, interaction.member.user.tag)).text()

    interaction.editReply(`[Version ${betaVersionPrototype.latest_version} (${betaVersionPrototype.latest_version_release_date}) has been added to the mod!\nView the commit here.](${data.data.commit?.html_url})!\n*${pscResetResponse}*`)
  })
}