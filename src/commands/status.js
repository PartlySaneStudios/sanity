//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const config = require("../config/config.json")

const subcommands = {
    set: { name: "set", function: handleSetCommand },
    toggle : { name: "toggle", function: handleToggleCommand },
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Set the status of the bot")
        .addSubcommand(subcommand => subcommand
            .setName("set")
            .setDescription("Set the status of the bot")
            .addStringOption(option => option
                .setName("status")
                .setDescription("The status to set")
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Idle', value: 'idle' },
                    { name: 'Do not disturb', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' }
                )
            )
            .addStringOption(option => option
                .setName("type")
                .setDescription("The type of activity to set")
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'PLAYING' },
                    { name: 'Streaming', value: 'STREAMING' },
                    { name: 'Listening', value: 'LISTENING' },
                    { name: 'Watching', value: 'WATCHING' },
                    { name: 'Competing', value: 'COMPETING' }
                ),
            )
            .addStringOption(option => option
                .setName("text")
                .setDescription("The text to set")
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName("toggle")
            .setDescription("Toggle the status of the bot")
        ),
    async run(client, interaction) {
        if (!config.allowedAnnouncementUsers.includes(interaction.member.id))
            return interaction.reply(`You do not have permission to use this command!`)

        const subcommand = interaction.options.getSubcommand();
        if (subcommands[subcommand]) {
            subcommands[subcommand].function(interaction);
        }
    }
};

async function handleSetCommand(interaction) {
    const status = interaction.options.getString("status");
    const type = interaction.options.getString("type");
    const text = interaction.options.getString("text");

    writeStatus(status, type, text);

    const embed = new EmbedBuilder()
        .setTitle("Status")
        .setDescription(`Set the status to ${status} with activity ${type} and text ${text}`)
        .setColor(config.color)

    await interaction.reply({ embeds: [embed] });
}

async function handleToggleCommand(interaction) {
    const active = !config.status.active

    writeStatus(config.status.status, config.status.type, config.status.text, active);

    const embed = new EmbedBuilder()
        .setTitle("Status")
        .setDescription(`Set the status to ${active ? "active" : "inactive"}`)
        .setColor(config.color)

    await interaction.reply({ embeds: [embed] });
}

function writeStatus(status, type, text, active = config.status.active) {
    config.status = {
        active: active,
        status: status,
        type: type,
        text: text
    }

    fs.writeFileSync("./src/config/config.json", JSON.stringify(config, null, 4))
}