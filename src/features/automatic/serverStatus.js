//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//

const { EmbedBuilder } = require('discord.js');
const Server = require('../../data/cloud');

const channelID = process.env.SERVER_STATUS_CHANNEL_ID;
let lastServerStatus = "online";

module.exports = async (client) => {
  const channel = client.channels.cache.get(channelID);

  const onlineEmbed = new EmbedBuilder()
    .setTitle("Server Status")
    .setDescription(":green_circle: The server is now online.")
    .setColor("#00FF00");
  const offlineEmbed = new EmbedBuilder()
    .setTitle("Server Status")
    .setDescription(":red_circle: The server just went offline.")
    .setColor("#FF0000");

  setInterval(async () => {
    const status = await Server.getStatus();

    if (status === null) {
      if (lastServerStatus === "online") {
        lastServerStatus = "offline";

        if (channel) channel.send({ embeds: [offlineEmbed] });
      }
    } else {
      if (lastServerStatus === "offline") {
        lastServerStatus = "online";

        if (channel) channel.send({ embeds: [onlineEmbed] });
      }
    }
  }, 3 * 1000)
}