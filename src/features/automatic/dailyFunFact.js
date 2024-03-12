//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//

const { EmbedBuilder } = require('discord.js');
const config = require('../../config/config.json');
const Server = require('../../data/cloud');

const channelID = process.env.DAILY_FUNFACT_CHANNEL_ID;
let previousFunFact = '';

module.exports = async (client) => {
    const channel = client.channels.cache.get(channelID);

    setInterval(async () => {
        const funfact = await Server.getDailyFunFact();
        if (!funfact) return;

        // Check if the fun fact has changed
        if (funfact !== previousFunFact) {
            const embed = new EmbedBuilder()
                .setTitle("Daily Fun Fact")
                .setDescription(`Here's your daily fun fact!\n${funfact}`)
                .setColor(config.color)
                .setTimestamp();

            if (channel) channel.send({ embeds: [embed] });

            // Update the previousFunFact variable
            previousFunFact = funfact;
        }
    }, 60 * 1000);
};
