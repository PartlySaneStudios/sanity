module.exports = async (client) => {
    /*
     * Slash Commands
    */
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) return;
        // Get the command from the collection
        const cmd = client.commands.get(interaction.commandName) ?? null;

        if (!cmd) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        let options = interaction.options._hoistedOptions;
        // Run the command
        cmd.run(client, interaction, options);
    })

    /*
     * Autocomplete
    */
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isAutocomplete()) return;
        // Get the command from the collection
        const cmd = client.commands.get(interaction.commandName)

        if (!cmd) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (!cmd.autocomplete) return;

        // Try to run the autocomplete
        try {
            await cmd.autocomplete(interaction, client)
        } catch (error) {
            console.error(error)
        }
    })
}
