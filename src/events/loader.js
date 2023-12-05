const { Collection } = require('discord.js')
const fs = require("fs");

module.exports = async (client) => {
    console.log("\x1b[42m%s\x1b[0m", "Ready.");

    require("./onCommandExec")(client);

    /* 
     * Load commands
    */
    client.commands = new Collection();
    // Read all files in the commands folder
    loadAllFilesInFolder("src/commands", client)
};

// Loads all commands recursively
function loadAllFilesInFolder(path, client) {
    // Read all files in the commands folder
    fs.readdir(path, (err, files) => {
        let commandsAdded = 0
        if (err) return console.error(err);
        // Filter out all non .js files
        // let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if (files.length <= 0) return console.log(`No slash commands found in ${path}.`);

        for (let fileName of files) {
            const fullFilePath = `${path}/${fileName}`
            // If the file is a folder, run itself
            if (fs.lstatSync(fullFilePath).isDirectory()) {
                console.log(`${fullFilePath} is a directory: ${fs.lstatSync(path).isDirectory()}`)
                loadAllFilesInFolder(`${fullFilePath}`)
                continue;
            }
            // If the file is not a .js file, pass
            if (fileName.split(".").pop() != "js") {
                continue
            }
            // Load file
            let file = require(`../../${fullFilePath}`);

            // Set command properties, which will be used when creating the slash command
            let name = file.name || file.replace(".js", "");
            let description = file.description || `No description provided for ${fullFilePath}.`;
            let options = file.options || [];

            const data = {
                name,
                description,
                options
            }

            // Set a new command in the Collection
            client.commands.set(data.name, {
                ...data,
                run: file.run
            });

            // Looping through all config entries
            for (let id of require("../database/config.json").guilds) {
                /*
                 * Creating them globally is not best, as it takes a really long time for them to update
                */
                client.guilds.cache.get(id)?.commands.create(data);
                console.log(`Added commands from ${path} to server ${id}`)
            }

            commandsAdded++
        }

        console.log(`Added ${commandsAdded} commands total to ${require("../database/config.json").guilds.length} servers.`)
    })
}
