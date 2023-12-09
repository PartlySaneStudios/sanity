const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the bot's ping.")
        .addStringOption(option => option.setName("input").setDescription("The input to echo back.").setRequired(true)),
    async run(client, interaction) {
        await interaction.reply(`Pong! ${client.ws.ping}ms.`);
    }
}
