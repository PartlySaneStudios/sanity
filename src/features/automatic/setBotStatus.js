//
// Written by J10a1n15.
// See LICENSE for copyright and license notices.
//


const { ActivityType } = require("discord.js")
const config = require("../../config/config.json")

module.exports = async (client) => {
  setInterval(() => {
    const text = config.status.text
    const type = translateType(config.status.type)
    if (config.status.active == true) {
      client.user.setActivity(text, { type: type })
    } else {
      client.user.setActivity(null)
    }
    client.user.setStatus(config.status.status)
  }, 3 * 1000)
}

function translateType(type) {
  switch (type) {
    case "PLAYING":
      return ActivityType.Playing
    case "STREAMING":
      return ActivityType.Streaming
    case "LISTENING":
      return ActivityType.Listening
    case "WATCHING":
      return ActivityType.Watching
    case "COMPETING":
      return ActivityType.Competing
  }
}