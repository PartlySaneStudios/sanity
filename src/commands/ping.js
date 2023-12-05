const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Pong!",
    options: [{
        name: "exampleinput",
        type: ApplicationCommandOptionType.String,
        description: "Example input",
        autocomplete: true,
        required: true
    }],
    async autocomplete(interaction) {
        await interaction.respond([
            { name: "Pong!", value: "Woo" }, 
            { name: "Ping!", value: "Hello HI" }
        ]);
    },
    run: async (client, interaction, options) => {
        await interaction.reply("Pong! " + options[0].value);
    }
}
