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
    fs.readdir("./src/commands/", (err, files) => {
        if (err) return console.error(err);
        // Filter out all non .js files
        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if (jsfiles.length <= 0) return console.log("No slash commands found.");

        for (let command of jsfiles) {
            let file = require(`../commands/${command}`);

            // Set command properties, which will be used when creating the slash command
            let name = file.name || command.replace(".js", "");
            let description = file.description || "No description provided.";
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
                console.log(`Added commands to server ${id}`)
            }
        }

        console.log(`Loaded ${jsfiles.length} slash commands.`);
    });
};
