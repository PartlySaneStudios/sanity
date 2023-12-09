const { Collection } = require('discord.js')
const fs = require("fs");

module.exports = async (client) => {
    client.commands = new Collection();
    require("./onCommandExec")(client);

    /* 
     * Load commands
    */
    // Read all files in the commands folder
    loadAllFilesInFolder("src/commands", client)

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
                console.log(`${fullFilePath} is a directory: ${fs.lstatSync(path).isDirectory()}`)
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

        console.log(`Added ${commandsAdded} commands total to ${require("../config/config.json").guilds.length} servers.`)
    })
}