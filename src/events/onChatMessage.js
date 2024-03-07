//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { Events, ChannelType } = require('discord.js');

module.exports = async (client) => {
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return;
        if (message.channel.type === 'DM') return;


        try {
            if (message.channel.type === ChannelType.GuildAnnouncement) message.crosspost();
        }
        catch (e) {
            console.error("Error while crossposting message: ", e);
        }
    });
}