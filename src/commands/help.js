//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Utils = require("../utils/StringUtils");
const config = require("../config/config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the help menu."),
    async run(client, interaction) {
        const commands = [];
        const embeds = [];
        const amountPerPage = 10; 
        
        for (const command of client.commands) {
            commands.push(command[1].data.toJSON());
        }

        let currentPage = 0;
        const pages = Math.ceil(commands.length / amountPerPage);

        for (let i = 0; i < pages; i++) {
            const embed = {
                title: "Help",
                description: "Here are the commands.",
                fields: [],
                color: parseInt(config.color.slice(1), 16),
                timestamp: new Date(),
                footer: {
                    text: `Page ${i + 1} of ${pages}`
                }
            };

            for (let j = 0; j < amountPerPage; j++) {
                const command = commands[i * amountPerPage + j];
                if (command) {
                    embed.fields.push({
                        name: Utils.capitalizeFirstLetter(command.name),
                        value: 
                        `
                            ${command.description}
                            Options: ${command.options.length > 0 
                                ? "\`/" + command.name + " <" + command.options.map(option => `${option.name}`).join("/") + ">\`"
                                : "None"}
                        `
                    });
                }
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
            return interaction.reply({ embeds: [embeds[0]]});
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

            collector.on("end", async () => {
                await response.edit({ components: [] });
            });
        });
    }
}