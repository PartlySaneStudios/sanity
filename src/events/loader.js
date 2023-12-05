const { Collection } = require('discord.js')
const fs = require("fs");

module.exports = async (client) => {
    console.log("\x1b[42m%s\x1b[0m", "Ready.");

    require("./onCommandExec")(client);

    // Load commands
    client.commands = new Collection();
    fs.readdir("./src/commands/", (err, files) => {
        if (err) return console.error(err);
        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if (jsfiles.length <= 0) return console.log("No slash commands found.");

        for (let command of jsfiles){
            let file = require(`../commands/${command}`);

            let name = file.name || command.replace(".js", "");
            let description = file.description || "No description provided.";
            let options = file.options || [];

            const data = {
                name,
                description,
                options
            }

            client.commands.set(data.name, {
                ...data,
                run: file.run
            });

            const PSS_SEVER_ID = "621364241554866188";

            /*
             * Creating them globally is not best, as it takes a really long time for them to update
            */
            client.guilds.cache.get(PSS_SEVER_ID).commands.create(data);
        }

        console.log(`Loaded ${jsfiles.length} slash commands.`);
    });
};
