module.exports = async (client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;
        const cmd = client.commands.get(interaction.commandName) ?? null;

        if (!cmd) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        let options = interaction.options._hoistedOptions;
        cmd.run(client, interaction, options);
    })

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isAutocomplete()) return;
        const cmd = client.commands.get(interaction.commandName)

        if (!cmd) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (!cmd.autocomplete) return;

        try {
            await cmd.autocomplete(interaction, client)
        } catch (error) {
            console.error(error)
        }
    })
}
