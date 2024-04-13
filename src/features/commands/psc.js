//
// Written by Su386.
// See LICENSE for copyright and license notices.
//

const { EmbedBuilder, SlashCommandBuilder, Embed } = require('discord.js');
const MainMenuData = require("../data/main_menu.js");
const SystemUtils = require("../utils/SystemUtils.js");
const config = require("../config/config.json")

const subcommands = {
    status: { name: "status", function: handleStatusCommand, permission: false },
    player: { name: "player", function: handleSkyblockPlayerCommand, permission: false},
    item: { name: "item", function: handleSkyblockItemCommand, permission: false},
    resetpublicdata: { name: "resetpublicdata", function: handleResetPSSCache, permission: true}
}

const items = []


async function getItem(id) {
  const itemData = await (await requestPSC(`/v1/hypixel/skyblockitem`)).json()

  const products = itemData.products
  for (let i = 0; i < products.length; i++) {
    const item = products[i]
    if (item.itemId.toLowerCase() == id.toLowerCase()) {
      return item
    }
  }

  return null
}

module.exports = {
    data: new SlashCommandBuilder()
      .setName("psc")
      .setDescription("Using the Partly Sane Cloud API")
      .addSubcommand(subcommand => subcommand
          .setName("status")
          .setDescription("Pings the status on the Partly Sane Cloud API")
      ).addSubcommand(subcommand => subcommand
        .setName("player")
        .addStringOption(option => option
          .setName("username")
          .setRequired(true)
          .setDescription("The username associated with the player")
        )
        .setDescription("Looks up data for a specific Skyblock Player on the Partly Sane Cloud API")
      ).addSubcommand(subcommand => subcommand
        .setName("resetpublicdata")
        .setDescription("Resets the public data")
      ).addSubcommand(subcommand => subcommand
        .setName("item")
        .addStringOption(option => option
          .setName("id")
          .setRequired(true)
          .setAutocomplete(true)
          .setDescription("The id associated with the item")
        )
        .setDescription("Looks up data for a specific Skyblock Item on the Partly Sane Cloud API")
      ),

    async loadItemAutoComplete() {
      const skyblockItem = await (await requestPSC("/v1/hypixel/skyblockitem")).json()
    
      const products = skyblockItem.products
      for (let i = 0; i < products.length; i++) {
        items.push({ id: products[i].itemId, name: products[i].name})
      }
    },

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
        if (item.name.toLowerCase().includes(focusedValue.toLowerCase()) || item.id.toLowerCase().includes(focusedValue.toLowerCase())) {
          results.push({
            name: item.name,
            value: item.id,
          });
        }
      }
  
      // remove elements after 25
      results.splice(25);
  
      await interaction.respond(results);
    },  
}


async function handleStatusCommand(client, interaction) {
  await interaction.reply("Loading...")

  const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("Status")
      .setFooter({ text: "/v1/status" })
  const response = await (await requestPSC("/v1/status", interaction.member.user.tag)).json()

  embed.addFields({ name: "Status:", value: `Success: \`\`${response.success}\`\``})

  await interaction.editReply({ embeds: [embed] })
}

async function handleSkyblockPlayerCommand(client, interaction) {
  await interaction.reply("Loading...")
  // Gets the parameters object
  const parameters = interaction.options
  const username = parameters.get("username").value
  await interaction.editReply(`Loading data for ${username}`)
  const uuid = (await (await fetch(`https://mowojang.matdoes.dev/users/profiles/minecraft/${username}`)).json()).id
  await interaction.editReply(`Loading data for ${username} (uuid: ${uuid})`)
  const playerData = await (await requestPSC(`/v1/hypixel/skyblockplayer?uuid=${uuid}`)).json()
  
  let embed = createPlayerEmbed(playerData).setTitle(username).setFooter({ text: `${uuid}\n/v1/hypixel/skyblockplayer` })
  await interaction.editReply({ content: " ", embeds: [embed]})
}

async function handleSkyblockItemCommand(client, interaction) {
  await interaction.reply("Loading...")
  // Gets the parameters object
  const parameters = interaction.options
  const id = parameters.get("id").value
  await interaction.editReply(`Loading data for ${id}`)
  
  const itemData = await getItem(id)

  if (itemData == null) {
    await interaction.editReply(`No such item found! (${id})`)
    return
  }
  let embed = createItemEmbed(itemData).setTitle(itemData.name).setFooter({ text: `${id}\n/v1/hypixel/skyblockitem` })
  await interaction.editReply({ content: " ", embeds: [embed]})
}

function createItemEmbed(itemData) {
    const embed = new EmbedBuilder()
    .setColor(config.color)

  embed.addFields(
    { name: "Item Information:", value: `Name: ${itemData.name}\nRarity: ${itemData.rarity}\nMaterial: ${itemData.material}\nUnstackable: ${itemData.unstackable}\nNPC Sell Price: ${itemData.npcSell} coins` },
  )

  if (itemData.lowestBin != 0) {
    embed.addFields({ name: "Auction Information:", value: `Lowest Bin: ${itemData.lowestBin} coins\nAverage Lowest Bin (24 Hours): ${itemData.averageLowestBin} coins` },)
  } else {
    embed.addFields({name: "Auction Information:", value: "Sellable: false"})
  }
  if (itemData.bazaarBuy != 0 || itemData.bazaarSell != 0) {
    embed.addFields({ name: "Bazaar Information:", value: `Buy: ${itemData.bazaarBuy} coins\nSell: ${itemData.bazaarSell} coins\nAverage Bazaar Buy (24 Hours): ${itemData.averageBazaarBuy} coins\nAverage Bazaar Sell (24 Hours): ${itemData.averageBazaarSell} coins` },)
  } else {
    embed.addFields({name: "Bazaar Information:", value: "Sellable: false"})
  }


  return embed
}

async function handleResetPSSCache(client, interaction) {
  await interaction.reply("Loading...")

  const embed = new EmbedBuilder()
      .setColor(config.color)
      .setTitle("Clear Cache")
      .setFooter({ text: "/v1/pss/middlemanagement/resetpublicdata" })
  const response = await (await requestPSC(`/v1/pss/middlemanagement/resetpublicdata?key=${process.env.CLEAR_CACHE_KEY}`, interaction.member.user.tag)).text()

  embed.addFields({ name: "Response:", value: `${response}`})

  await interaction.editReply({ content: " ", embeds: [embed] })
}

function createPlayerEmbed(playerdata) {
  const skyblockplayer = playerdata.skyblockPlayer
  const currentProfileId = skyblockplayer.currentProfileId

  let currentProfile = {}
  for (let i = 0; i < skyblockplayer.profiles.length; i++) {
    const profile = skyblockplayer.profiles[i]
    if (profile.profileId == currentProfileId) {
      currentProfile = profile
      break
    }
  }

  const embed = new EmbedBuilder()
    .setColor(config.color)

  embed.addFields(
    { 
      name: "Skyblock:", 
      value: 
`Skyblock Level: ${currentProfile.skyblockExperience/100}
Pet Name: ${currentProfile.petName}\nSecret Count: ${currentProfile.secretsCount}
Average Secrets per Run ${Math.round(currentProfile.secretsCount*10/currentProfile.totalRuns)/10}` 
    },
    { 
      name: "Skills:", 
      value:`Catacombs Experience: ${Math.round(currentProfile.catacombsExperience*10)/10}\nCombat Experience: ${Math.round(currentProfile.combatExperience*10)/10}\nMining Experience: ${Math.round(currentProfile.miningExperience*10)/10}\nForaging Experience: ${Math.round(currentProfile.foragingExperience*10)/10}\nFarming Experience: ${Math.round(currentProfile.farmingExperience*10)/10}\nEnchanting Experience: ${Math.round(currentProfile.enchantingExperience*10)/10}\nFishing Experience: ${Math.round(currentProfile.fishingExperience*10)/10}\nAlchemy Experience: ${Math.round(currentProfile.alchemyExperience*10)/10}\nTaming Experience: ${Math.round(currentProfile.tamingExperience*10)/10}` },
    { name: "Normal Dungeon Runs:", value: `Floor Entrance: ${currentProfile.normalRuns[0]}\nFloor 1: ${currentProfile.normalRuns[1]}\nFloor 2: ${currentProfile.normalRuns[2]}\nFloor 3: ${currentProfile.normalRuns[3]}\nFloor 4: ${currentProfile.normalRuns[4]}\nFloor 5: ${currentProfile.normalRuns[5]}\nFloor 6: ${currentProfile.normalRuns[6]}\nFloor 7: ${currentProfile.normalRuns[7]}` },
    { name: "Master Mode Dungeon Runs:", value: `Floor Entrance: ${currentProfile.masterModeRuns[0]}\nFloor 1: ${currentProfile.masterModeRuns[1]}\nFloor 2: ${currentProfile.masterModeRuns[2]}\nFloor 3: ${currentProfile.masterModeRuns[3]}\nFloor 4: ${currentProfile.masterModeRuns[4]}\nFloor 5: ${currentProfile.masterModeRuns[5]}\nFloor 6: ${currentProfile.masterModeRuns[6]}\nFloor 7: ${currentProfile.masterModeRuns[7]}` }
  )
  return embed
}

function formatUUID(uuid) {
  return uuid.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

async function requestPSC(endpoint, user) {
  if (endpoint[0] == "/") {
    endpoint = endpoint.substring(1)
  }

  let headers = new Headers({
    "Accept"       : "application/json",
    "Content-Type" : "application/json",
    "User-Agent"   : "Sanity/"+ user
  });

  const url = process.env.SERVER_URL + "/" + endpoint
  return (await fetch(url, {
    method: 'GET',
    headers: headers
  }))
}

