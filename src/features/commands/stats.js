//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require("../../config/config.json")
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const subcommands = {
    downloads: { name: "downloads", function: handleDownloadsCommand, permission: false },
}

let items = []
loadAutoComplete()

module.exports = {
    data: new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Using the Partly Sane Cloud API")
      .addSubcommand(subcommand => subcommand
          .setName("downloads")
          .setDescription("Pings the status on the Partly Sane Cloud API")
          .addStringOption(option => option
            .setName("version")
            .setRequired(false)
            .setAutocomplete(true)
            .setDescription("Specified version to see downloads")
          )
      ),

    async run(client, interaction) {
        // Gets the subcommand
        const subcommand = interaction.options.getSubcommand();

        const subcommandObject = subcommands[subcommand]

        if (subcommandObject) {
            // Checks for permission
            if (subcommandObject.permission && !config.allowedClearCacheUsers.includes(interaction.member.id))
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
    },
    async autocomplete(client, interaction) {
      const focusedValue = interaction.options.getFocused();
  
      const results = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.toLowerCase().includes(focusedValue.toLowerCase())) {
          results.push({
            name: item,
            value: item,
          });
        }
      }
  
      // remove elements after 25
      results.splice(25);
  
      await interaction.respond(results);
    }
}


async function handleDownloadsCommand(client, interaction) {
  await interaction.reply("Loading...")

  const githubDownloads = await getGithubDownloads()
  items = Object.keys(githubDownloads)
  const modrinthDownloads = await getModrinthDownloads()

  const mergedDownloads = {}
  let githubDownloadTotal = 0
  let modrinthDownloadTotal = 0
  for (let i = 0; i < Object.keys(githubDownloads).length; i++) {
    const version = Object.keys(githubDownloads)[i]

    if (mergedDownloads[version] == null) {
      mergedDownloads[version] = {}
      mergedDownloads[version].githubDownloads = 0
      mergedDownloads[version].modrinthDownloads = 0
    }

    const verisonDownloads = githubDownloads[version].downloads
    mergedDownloads[version].githubDownloads += verisonDownloads
    githubDownloadTotal += verisonDownloads
  }

  for (let i = 0; i < Object.keys(modrinthDownloads).length; i++) {
    const version = Object.keys(modrinthDownloads)[i]

    if (mergedDownloads[version] == null) {
      mergedDownloads[version] = {}
      mergedDownloads[version].githubDownloads = 0
      mergedDownloads[version].modrinthDownloads = 0
    }

    const verisonDownloads = modrinthDownloads[version].downloads
    mergedDownloads[version].modrinthDownloads += verisonDownloads
    modrinthDownloadTotal += verisonDownloads
  }

  let versionDownloadCount = 0
  const parameters = interaction.options
  const specifiedVersion = parameters.get("version")?.value

  let versionDownloadString = ""
  if (specifiedVersion == null || mergedDownloads[specifiedVersion] == null) { // if there's no specified version, show the 5 most recent
    const versions = Object.keys(mergedDownloads)

    for (let i = 0; i < versions.length && i < 5 ; i++) {
      const totalDownloads = mergedDownloads[versions[i]].githubDownloads + mergedDownloads[versions[i]].modrinthDownloads
      versionDownloadString += `__${versions[i]}__\n${totalDownloads} total - ${mergedDownloads[versions[i]].githubDownloads} GitHub, ${mergedDownloads[versions[i]].modrinthDownloads} Modrinth\n`
    }
  } else {
    const totalDownloads = mergedDownloads[specifiedVersion].githubDownloads + mergedDownloads[specifiedVersion].modrinthDownloads
    versionDownloadString = `__${specifiedVersion}__\n${totalDownloads} total - ${mergedDownloads[specifiedVersion].githubDownloads} GitHub, ${mergedDownloads[specifiedVersion].modrinthDownloads} Modrinth`
  }

  const totalDownloadString = `${githubDownloadTotal + modrinthDownloadTotal} total - ${githubDownloadTotal} GitHub, ${modrinthDownloadTotal} Modrinth`


  const embed = new EmbedBuilder()
    .setTitle("Download Count")
    .setColor(config.color)
    .addFields({ name: "Total:", value: totalDownloadString})
    .addFields({ name: "By Version", value: versionDownloadString})
  
  await interaction.editReply({ content: " ", embeds: [embed] })

}

async function loadAutoComplete() {
  items = await Object.keys(await getGithubDownloads())
}




async function getGithubDownloads() {
  const isBreak = true

  let page = 1

  const obj = {}
  while(isBreak) {
    const response = (await octokit.request('GET /repos/{owner}/{repo}/releases?per_page=100&page={page}', {
      owner: 'PartlySaneStudios',
      repo: 'partly-sane-skies',
      page: page,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })).data

    if (response.length == 0) {
      break
    }

    for (let i = 0; i < response.length; i++) {
      const version = response[i]
      
      const versionTag = version.tag_name
      let downloadCount = 0
      for (let j = 0; j < version.assets.length; j++) {
        downloadCount += version.assets[j].download_count
      }

      if (obj[versionTag] == null) {
        obj[versionTag] = {}
      }

      obj[versionTag].downloads = downloadCount
    }
    page++
  }

  return obj
}

async function getModrinthDownloads() {
  const response = await (await fetch("https://api.modrinth.com/v2/project/partly-sane-skies/version")).json()

  const obj = {}
  for (let i = 0; i < response.length; i++) {
    const version = response[i]

    const modrinthVersionNumber = version.version_number

    let versionTag
    if (modrinthVersionNumber.startsWith("v0.")) {
      versionTag = "beta-" + modrinthVersionNumber
    } else {
      versionTag = modrinthVersionNumber
    }
    const downloadCount = version.downloads

    if (obj[versionTag] == null) {
      obj[versionTag] = {}
    }

    obj[versionTag].downloads = downloadCount
  }

  return obj
}