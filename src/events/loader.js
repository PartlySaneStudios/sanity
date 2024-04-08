//
// Written by Su386 and J10a1n15.
// See LICENSE for copyright and license notices.
//


const { Collection } = require('discord.js')
const fs = require("fs");

module.exports = async (client) => {
    client.commands = new Collection();

    fs.readdir("src/events", (err, files) => {
        if (err || files.length <= 0) return console.error(err || "No events found.");

        files.forEach((file) => (file.endsWith(".js") && file !== "loader.js") && require(`./${file}`)(client));
    });

    require("../features/automatic/serverStatus")(client);
    require("../features/automatic/setBotStatus")(client);
    require("../features/automatic/dailyFunFact")(client);

    /* 
     * Load commands
    */
    // Read all files in the commands folder
    loadAllFilesInFolder("src/features/commands", client)

    console.log("\x1b[42m%s\x1b[0m", "Ready.");
};

// Loads all commands recursively
function loadAllFilesInFolder(path, client) {
    // Read all files in the commands folder
    fs.readdir(path, (err, files) => {
        let commandsAdded = 0
        if (err) return console.error(err);
        if (files.length <= 0) return console.log(`No slash commands found in ${path}.`);

        for (let fileName of files) {
            const fullFilePath = `${path}/${fileName}`
            // If the file is a folder, run itself
            if (fs.lstatSync(fullFilePath).isDirectory()) {
                loadAllFilesInFolder(`${fullFilePath}`, client)
                continue;
            }
            // If the file is not a .js file, pass
            if (fileName.split(".").pop() != "js") {
                continue
            }
            // Load file
            let command = require(`../../${fullFilePath}`);
            if ("data" in command && "run" in command) {
                // Set a new command in the Collection
                client.commands.set(command.data.name, command);

                // Looping through all config entries
                for (let id of require("../config/config.json").guilds) {
                    /*
                     * Creating them globally is not best, as it takes a really long time for them to update
                    */
                    client.guilds.cache.get(id)?.commands.create(command.data.toJSON());
                    //console.log(`Added commands from ${path} to server ${id}`)
                }
            } else {
                console.log(`Missing "data" or "run" for command at ${data.name}.`)
            }

            commandsAdded++
        }

        console.log(`Added ${commandsAdded} command${commandsAdded != 1 ? "s" : ""} total to ${require("../config/config.json").guilds.length} server${require("../config/config.json").guilds.length != 1 ? "s" : ""}.`)
    })
}