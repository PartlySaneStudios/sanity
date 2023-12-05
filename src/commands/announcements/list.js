const { EmbedBuilder } = require('discord.js');
const Announcements = require("../../data/announcements.js")

module.exports = {
  name: "announcementlist",
  description: "Lists all announcements currently in the repo",
  options: [],
  run: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setColor(0xc297db)
      .setTitle("Announcements:")
    const announcements = await Announcements.getAnnouncements();

    console.log(announcements)


    // let i = 1
    for(let i = 0; i < announcements.length; i++) {
      let announcement = announcements[i];
      console.log(announcement)
      let field = ""
      field += `Title: \`\`\`${announcement.name}\`\`\`\n`
      field += `Date: \`\`\`${announcement.date}\`\`\`\n`
      field += `Description: \`\`\`${announcement.description}\`\`\`\n`
      field += `[Link:](${announcement.link}) \`\`\`${announcement.link}\`\`\``

      embed.addFields( { name: `${i+1}: `, value: field })
    }
      await interaction.reply({ embeds: [embed] });
  }
}