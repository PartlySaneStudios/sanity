module.exports = {
    name: "ping",
    description: "Pong!",
    options: [],
    run: async (client, interaction) => {
        await interaction.reply("Pong!");
    }
}