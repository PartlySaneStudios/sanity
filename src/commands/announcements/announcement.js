const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Announcements = require("../../data/announcements.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announcement")
    .setDescription("Announcement commands")
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("List all announcements"))
  ,
  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      await handleListCommand(client, interaction);
    }
  }
}

async function handleListCommand(client, interaction) {
  const embed = new EmbedBuilder()
    .setColor(0xc297db)
    .setTitle("Announcements:")
  const announcements = await Announcements.getAnnouncements();

  for (let i = 1; i <= announcements.length; i++) {
    let announcement = announcements[i - 1];
    let field = ""
    field += `Title: \`\`\`${announcement.name}\`\`\`\n`
    field += `Date: \`\`\`${announcement.date}\`\`\`\n`
    field += `Description: \`\`\`${announcement.description}\`\`\`\n`
    field += `[Link:](${announcement.link}) \`\`\`${announcement.link}\`\`\``

    embed.addFields({ name: `${i}: `, value: field })
  }
  await interaction.reply({ embeds: [embed] });
}
