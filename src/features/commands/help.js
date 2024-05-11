//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Utils = require("../../utils/StringUtils");
const config = require("../../config/config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows the help menu."),
  async run(client, interaction) {
    const commands = client.commands.map(command => {
      return {
        name: command.data.name,
        description: command.data.description,
        options: command.data.options
      };
    });
    const amountPerPage = 10;

    const pages = Math.ceil(commands.length / amountPerPage);

    const embeds = Array.from({ length: pages }, (_, i) => {
      const startIndex = i * amountPerPage;
      const commandsOnPage = commands.slice(startIndex, startIndex + amountPerPage);

      return {
        title: "Help",
        description: "Here are the commands.",
        fields: commandsOnPage.map(command => ({
          name: Utils.capitalizeFirstLetter(command.name),
          value: `${command.description}\nOptions: ${command.options.length > 0
            ? `/${command.name} <${command.options.map(option => option.name).join("/")}>`
            : "None"}`,
        })),
        color: parseInt(config.color.slice(1), 16),
        timestamp: new Date(),
        footer: {
          text: `Page ${i + 1} of ${pages}`
        }
      };
    });

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
      );

    const replyOptions = { embeds: [embeds[0]], components: [row] };
    if (pages === 1) {
      return interaction.reply({ embeds: [embeds[0]] });
    }

    const response = await interaction.reply(replyOptions);
    const collectorFilter = i => i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

    let currentPage = 0;
    collector.on("collect", async i => {
      if (i.customId === "next") {
        currentPage++;
      } else if (i.customId === "previous") {
        currentPage--;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === pages - 1);

      await i.update({ embeds: [embeds[currentPage]], components: [row] });
    });

    collector.on("end", async () => {
      await response.edit({ components: [] });
    });
  }
};
