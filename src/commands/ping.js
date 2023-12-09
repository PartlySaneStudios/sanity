//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    async run(client, interaction) {
        await interaction.reply(`Pong!`);
    }
}
