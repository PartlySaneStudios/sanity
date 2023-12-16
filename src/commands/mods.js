//
// Written by Su386.
// See LICENSE for copyright and license notices.
//


const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const ModsData = require("../data/mods.js");
const SystemUtils = require("../utils/SystemUtils.js");
const config = require("../config/config.json");
const JSZip = require('jszip');

// Announcement data structure
const AnnouncementPrototype = {
  name: "",
  date: "",
  description: "",
  link: "",
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mods")
    .setDescription("Mod command")
    .addSubcommand(subcommand => // Creates list subcommand
      subcommand
        .setName("list")
        .setDescription("List all mods")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("add") // Creates remove subcommand
        .setDescription("List removes an announcement at a given position in the list. (First = 1)")
        .addStringOption(option => 
          option
            .setName("filelink")
            .setRequired(true)
            .setDescription("The download link for mod update")
        )
        .addStringOption(option => 
          option
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

    if (subcommand === "add") { // Handles add subcommand
      try {
      await handleAddCommand(client, interaction)
      } catch {
        await interaction.followUp("Error updating mod")
      }
    }

    if (subcommand === "update") { // Handles add subcommand
      try {
        await handleUpdateCommand(client, interaction)
      } catch {
        await interaction.followUp("Error updating mod")
      }
    }

  
  }
}

const ModPrototype = {
  name: "",
  download: "",
  versions: {}
}

async function handleAddCommand(client, interaction) {
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
  
  await interaction.editReply(`Succesfully added ${id} to the mods list!`)
}

async function handleUpdateCommand(client, interaction) {
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
  
  await interaction.editReply(`Succesfully updated ${id} to version ${version}!`)
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