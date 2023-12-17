//
// Written by Su386.
// See LICENSE for copyright and license notices.
//


const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const JSZip = require('jszip');
const ModsData = require("../data/mods.js");
const SystemUtils = require("../utils/SystemUtils.js");
const config = require("../config/config.json")

const embeds = [];
const amountPerPage = 5;
let currentPage = 0;

const subcommands = {
  list: { name: "list", function: handleListCommand, permission: false },
  add: { name: "add", function: handleAddCommand, permission: true },
  update: { name: "update", function: handleUpdateCommand, permission: true },
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
      .setDescription("List removes an announcement at a given position in the list. (First = 1)")
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
      .setDescription("Adds announcement, shifts positions. Former 1 becomes 2. (First = 1)")
      .addStringOption(option =>
        option
          .setName("filelink")
          .setRequired(true)
          .setDescription("The download link for mod update")
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
      await subcommandObject.function(client, interaction)
    }
  }
}


async function handleAddCommand(client, interaction) {
  const ModPrototype = {
    name: "",
    download: "",
    versions: {}
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
  const mcModInfoTxt = await extractTextFileFromJar(file, "mcmod.info")
  const mcModInfoJson = await JSON.parse(mcModInfoTxt)[0]

  await interaction.editReply("Organizing data...")
  let mod = { ...ModPrototype }

  mod.name = mcModInfoJson.name
  mod.download = parameters.get("websitelink").value

  const version = mcModInfoJson.version
  const id = mcModInfoJson.modid
  const modVersions = mod.versions
  modVersions[version] = hash
  mod.versions = modVersions

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
    versions: {}
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
  const mcModInfoTxt = await extractTextFileFromJar(file, "mcmod.info")
  const mcModInfoJson = await JSON.parse(mcModInfoTxt)[0]

  await interaction.editReply("Organizing data...")
  let mod = Object.create(ModPrototype)

  mod.name = mcModInfoJson.name

  const version = mcModInfoJson.version
  const id = mcModInfoJson.modid
  const modVersions = mod.versions
  modVersions[version] = hash

  mod.download = modsDataJson[id].download

  mod.versions = modVersions

  await interaction.editReply("Editing Data")
  modsDataJson[id] = mod
  fullData.mods = modsDataJson

  await interaction.editReply("Sending Data")
  await SystemUtils.sendRequest("data/mods.json", `Updated ${id} to version ${version}`, interaction.member.user.tag, fullData, modsDataSha)

  await interaction.editReply(`Successfully updated ${id} to version ${version}!`)
}




function extractTextFileFromJar(jarBuffer, textFileName) {
  return JSZip.loadAsync(jarBuffer)
    .then(zip => {
      if (zip.files[textFileName]) {
        return zip.files[textFileName].async('string');
      } else {
        throw new Error(`Text file '${textFileName}' not found in the JAR.`);
      }
    });
}

async function handleListCommand(client, interaction) {
  const modsData = await ModsData.getModsData();
  const mods = modsData.json.mods;

  const pages = Math.ceil(Object.keys(mods).length / amountPerPage);

  for (let i = 0; i < pages; i++) {
    const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("Mods:")
      .setURL(`https://github.com/${process.env.OWNER}/${process.env.REPO}/blob/main/data/mods.json`)
      .setFooter({text: `Page ${i + 1} of ${pages}`});

    const startIndex = i * amountPerPage;
    const endIndex = startIndex + amountPerPage;
    const modsSubset = Object.keys(mods).slice(startIndex, endIndex);

    for (const modKey of modsSubset) {
      const mod = mods[modKey];
      let field = "";
      field += `Key: \`\`\`${modKey}\`\`\`\n`;
      field += `[Download:](${mod.download}) \`\`\`${mod.download}\`\`\``;

      for (const version in mod.versions) {
        field += `\n${version}: \`\`\`${mod.versions[version]}\`\`\``;
      }

      embed.addFields({ name: `**__${mod.name}:__** `, value: field });
    }

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
      } else if (currentPage == pages - 1) {
        row.components[0].setDisabled(false);
      } else {
        row.components[0].setDisabled(false);
        row.components[1].setDisabled(false);
      }

      await i.update({ embeds: [embeds[currentPage]], components: [row] });
    });
  });
}