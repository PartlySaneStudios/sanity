//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { Events } = require('discord.js');

module.exports = async (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isAutocomplete()) return;

        const cmd = client.commands.get(interaction.commandName) ?? null;

        if (!cmd) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            // Execute the command
            cmd.autocomplete(client, interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    });
}