//
// Written by Su386 and J10a1n15.
// See LICENSE for copyright and license notices.
//


const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ModsData = require("../data/mods.js");
const SystemUtils = require("../utils/SystemUtils.js");
const config = require("../config/config.json")


const subcommands = {
  list: { name: "list", function: handleListCommand, permission: false },
  add: { name: "add", function: handleAddCommand, permission: true },
  update: { name: "update", function: handleUpdateCommand, permission: true },
  bupdate: { name: "bupdate", function: handleBetaUpdateCommand, permission: true },
  search: { name: "search", function: handleSearchCommand, permission: false },
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mods")
    .setDescription("Mod command")
    .addSubcommand(subcommand => subcommand
      .setName("list")// Creates list subcommand
      .setDescription("List all mods")
    )
    .addSubcommand(subcommand => subcommand
      .setName("add") // Creates remove subcommand
      .setDescription("Adds a mod to the update channel")
      .addStringOption(option => option
        .setName("filelink")
        .setRequired(true)
        .setDescription("The download link for mod update")
      )
      .addStringOption(option => option
        .setName("websitelink")
        .setRequired(true)
        .setDescription("The link for the official website.")
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName("update") // Creates add subcommand
      .setDescription("Updates a mod in the normal update channel")
      .addStringOption(option =>
        option
          .setName("filelink")
          .setRequired(true)
          .setDescription("The download link for mod update")
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName("bupdate")
      .setDescription("Updates a mod in the beta update channel")
      .addStringOption(option =>
        option
          .setName("filelink")
          .setRequired(true)
          .setDescription("The download link for mod update")
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName("search") // Creates search subcommand
      .setDescription("Search for a mod by name")
      .addStringOption(option => option
        .setName("search")
        .setDescription("Search for a mod by name")
        .setRequired(true)
        .setAutocomplete(true)
      ),
    ),
  async autocomplete(client, interaction) {
    const focusedValue = interaction.options.getFocused();
    const modsData = await ModsData.getModsData();
    const mods = modsData.json.mods;

    const results = [];
    for (const modKey in mods) {
      const mod = mods[modKey];
      if (mod?.name?.toLowerCase().includes(focusedValue.toLowerCase())) {
        results.push({
          name: mod.name,
          value: modKey,
        });
      }
    }

    // remove elements after 25
    results.splice(25);

    await interaction.respond(results);
  },

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


async function handleAddCommand(client, interaction) {
  const ModPrototype = {
    name: "",
    download: "",
    versions: {},
    betaVersions: {}
  }

  // Creates an initial reply 
  await interaction.reply("Loading...")

  // Gets the parameters object
  const parameters = interaction.options

  // Gets the mod file
  await interaction.editReply("Downloading mod...")

  const url = parameters.get("filelink").value
  const file = await SystemUtils.downloadFileInMemory(url)

  await interaction.editReply("Getting Mods Data")
  const modsDataObject = await ModsData.getModsData()
  const modsDataSha = modsDataObject.sha
  const fullData = modsDataObject.json
  const modsDataJson = fullData.mods

  await interaction.editReply("Generating Hash...")
  const hash = await SystemUtils.calculateSHA256(file)


  await interaction.editReply("Extracting File...")
  const mcModInfoTxt = await SystemUtils.extractTextFileFromJar(file, "mcmod.info")
  const mcModInfoJson = await JSON.parse(mcModInfoTxt)[0]

  await interaction.editReply("Organizing data...")
  let mod = { ...ModPrototype }

  mod.name = mcModInfoJson.name
  mod.download = parameters.get("websitelink").value

  const version = mcModInfoJson.version
  const id = mcModInfoJson.modid
  let modVersions = {}
  try {
    modVersions = modsDataJson[id].versions
  } catch {
    modVersions = mod.versions
  }
  modVersions[version] = hash

  await interaction.editReply("Editing Data")
  modsDataJson[id] = mod
  fullData.mods = modsDataJson

  await interaction.editReply("Sending Data")
  await SystemUtils.sendRequest("data/mods.json", `Added ${id} to the mods list`, interaction.member.user.tag, fullData, modsDataSha)

  await interaction.editReply(`Successfully added ${id} to the mods list!`)
}

async function handleUpdateCommand(client, interaction) {
  const ModPrototype = {
    name: "",
    download: "",
    versions: {},
    betaVersions: {}
  }

  // Creates an initial reply 
  await interaction.reply("Loading...")

  // Gets the parameters object
  const parameters = interaction.options

  // Gets the mod file
  await interaction.editReply("Downloading mod...")

  const url = parameters.get("filelink").value
  const file = await SystemUtils.downloadFileInMemory(url)

  await interaction.editReply("Getting Mods Data")
  const modsDataObject = await ModsData.getModsData()
  const modsDataSha = modsDataObject.sha
  const fullData = modsDataObject.json
  const modsDataJson = fullData.mods

  await interaction.editReply("Generating Hash...")
  const hash = await SystemUtils.calculateSHA256(file)


  await interaction.editReply("Extracting File...")
  const mcModInfoTxt = await SystemUtils.extractTextFileFromJar(file, "mcmod.info")
  const mcModInfoJson = await JSON.parse(mcModInfoTxt)[0]

  await interaction.editReply("Organizing data...")
  let mod = Object.create(ModPrototype)

  mod.name = mcModInfoJson.name

  const version = mcModInfoJson.version
  const id = mcModInfoJson.modid
  let modVersions = {}
  try {
    modVersions = modsDataJson[id].versions
  } catch {
    modVersions = mod.versions
  }
  modVersions[version] = hash

  let betaModVersions = {}
  try {
    betaModVersions = modsDataJson[id].betaVersions
  } catch {
    betaModVersions = mod.betaVersions
  }
  betaModVersions[version] = hash

  mod.download = modsDataJson[id].download

  mod.versions = modVersions
  mod.betaVersions = betaModVersions

  await interaction.editReply("Editing Data")
  modsDataJson[id] = mod
  fullData.mods = modsDataJson

  await interaction.editReply("Sending Data")
  await SystemUtils.sendRequest("data/mods.json", `Updated ${id} to version ${version}`, interaction.member.user.tag, fullData, modsDataSha)

  await interaction.editReply(`Successfully updated ${id} to version ${version}!`)
}

async function handleBetaUpdateCommand(client, interaction) {
  const ModPrototype = {
    name: "",
    download: "",
    versions: {},
    betaVersions: {}
  }

  // Creates an initial reply 
  await interaction.reply("Loading...")

  // Gets the parameters object
  const parameters = interaction.options

  // Gets the mod file
  await interaction.editReply("Downloading mod...")

  const url = parameters.get("filelink").value
  const file = await SystemUtils.downloadFileInMemory(url)

  await interaction.editReply("Getting Mods Data")
  const modsDataObject = await ModsData.getModsData()
  const modsDataSha = modsDataObject.sha
  const fullData = modsDataObject.json
  const modsDataJson = fullData.mods

  await interaction.editReply("Generating Hash...")
  const hash = await SystemUtils.calculateSHA256(file)


  await interaction.editReply("Extracting File...")
  const mcModInfoTxt = await SystemUtils.extractTextFileFromJar(file, "mcmod.info")
  const mcModInfoJson = await JSON.parse(mcModInfoTxt)[0]

  await interaction.editReply("Organizing data...")
  let mod = Object.create(ModPrototype)

  mod.name = mcModInfoJson.name

  const version = mcModInfoJson.version
  const id = mcModInfoJson.modid
  let modVersions = {}
  try {
    modVersions = modsDataJson[id].versions
  } catch {
    modVersions = mod.versions
  }

  let betaModVersions = {}
  try {
    betaModVersions = modsDataJson[id].betaVersions
  } catch {
    betaModVersions = mod.betaVersions
  }
  betaModVersions[version] = hash

  mod.download = modsDataJson[id].download

  mod.versions = modVersions
  mod.betaVersions = betaModVersions

  await interaction.editReply("Editing Data")
  modsDataJson[id] = mod
  fullData.mods = modsDataJson

  await interaction.editReply("Sending Data")
  await SystemUtils.sendRequest("data/mods.json", `Updated ${id} to version ${version}`, interaction.member.user.tag, fullData, modsDataSha)

  await interaction.editReply(`Successfully updated ${id} to **beta** version ${version}!`)
}

async function handleSearchCommand(client, interaction) {
  const modsData = await ModsData.getModsData();
  const mods = modsData.json.mods;

  // if autocomplete has data, edit mods to only include that data
  const autocompleteValue = interaction.options.getString("search");
  if (autocompleteValue) {
    for (const modKey in mods) {
      if (!modKey.toLowerCase().includes(autocompleteValue.toLowerCase())) {
        delete mods[modKey];
      }
    }
  }

  // if no mods are found, return
  if (Object.keys(mods).length == 0) {
    return interaction.reply("No mods found!");
  }

  const mod = mods[Object.keys(mods)[0]];

  // Get an array of non-beta versions
  const nonBetaVersions = Object.keys(mod.versions);

  let versionsField = "";
  for (const [version, value] of Object.entries(mod.versions)) {
    versionsField += `\n${version}: \`\`\`${value}\`\`\``;
  }

  let betaVersionsField = "";
  for (const [version, value] of Object.entries(mod.betaVersions)) {
    if (nonBetaVersions.includes(version)) continue;
    betaVersionsField += `\n${version}: \`\`\`${value}\`\`\``;
  }

  const embed = new EmbedBuilder()
    .setColor(config.color)
    .setTitle("Mod - " + mod.name)
    .setDescription(`Mod ID: ${Object.keys(mods)[0]}\n\nDownload: ${mod.download}`)
    .addFields({ name: "Versions", value: versionsField })
    if (betaVersionsField) 
      embed.addFields({ name: "Beta Versions", value: betaVersionsField });

  interaction.reply({ embeds: [embed] });
}

const amountPerPage = 25;
async function handleListCommand(client, interaction) {
  const embeds = [];

  const modsData = await ModsData.getModsData();
  const mods = modsData.json.mods;
  const pages = Math.ceil(Object.keys(mods).length / amountPerPage);
  let currentPage = 0;
  const searchCommandGuild = await interaction.guild.commands.fetch().then(commands => commands.find(cmd => cmd.name == "mods").id);

  const modsAmount = Object.keys(mods).length
  for (let i = 0; i < pages; i++) {
    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle(`Mods: (${modsAmount} total)`)
      .setURL(`https://github.com/${process.env.OWNER}/${process.env.REPO}/blob/main/data/mods.json`)
      .setFooter({ text: `Page ${i + 1} of ${pages}` });

    const startIndex = i * amountPerPage;
    const endIndex = startIndex + amountPerPage;
    let keys = Object.keys(mods).sort(function (a, b) {
      var nameA = a.toLowerCase();
      var nameB = b.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    keys = keys.filter(function (item) {
      return item !== "partlysaneskies" || item !== "Forge";
    });

    keys = ["Forge", "partlysaneskies", ...keys]

    const modsSubset = keys.slice(startIndex, endIndex);

    let desc = "";
    for (const modKey of modsSubset) {
      const mod = mods[modKey];
      const numOfRegular = Object.keys(mod.versions).length
      const numOfBetaOnly = Object.keys(mod.betaVersions).length - numOfRegular
      desc += `- __${mod.name}__ (${modKey}): ${numOfRegular} known version${numOfRegular == 1 ? "" : "s"}${numOfBetaOnly != 0 ? `, ${numOfBetaOnly} known beta version${numOfBetaOnly == 1 ? "" : "s"}.` : "."}\n`;
    }
    desc += `Click here for search: </mods search:${searchCommandGuild}>`

    embed.setDescription(desc);
    embeds.push(embed);
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
    )

  if (pages == 1) {
    return interaction.reply({ embeds: [embeds[0]] });
  }
  await interaction.reply({ embeds: [embeds[currentPage]], components: [row] }).then(async response => {
    const collectorFilter = i => i.user.id === interaction.user.id;

    const collector = response.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

    collector.on("collect", async i => {
      if (i.customId === "next") {
        currentPage++;
      } else if (i.customId === "previous") {
        currentPage--;
      }

      if (currentPage == 0) {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(false);
      } else if (currentPage == pages - 1) {
        row.components[0].setDisabled(false);
        row.components[1].setDisabled(true);
      } else {
        row.components[0].setDisabled(false);
        row.components[1].setDisabled(false);
      }

      await i.update({ embeds: [embeds[currentPage]], components: [row] });
    });

    collector.on("end", async () => {
      await response.edit({ components: [] });
    });
  });
}