module.exports = async (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (interaction.isAutocomplete()) {
            const cmd = client.commands.get(interaction.commandName)

            if (!cmd) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await cmd.autocomplete(interaction, client)
            } catch (error) {
                console.error(error)
            }
        }

        if (!interaction.isCommand()) return;
        const cmd = client.commands.get(interaction.commandName) ?? null;

        if (!cmd) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        let options = interaction.options._hoistedOptions;
        cmd.run(client, interaction, options);
    })
}
