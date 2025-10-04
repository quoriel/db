const { Interpreter } = require("@tryforge/forgescript");
const { EventHandler } = require("../managers/eventHandler");
const { QuorielDB } = require("../main");

exports.default = new EventHandler({
    name: "recordRemove",
    description: "Triggered when an entity record is deleted from the database (extracting data from type/key/value environment variables)",
    version: "1.4.0",
    listener(environment) {
        const commands = this.getExtension(QuorielDB, true).commands.get("recordRemove");
        if (commands) {
            for (const command of commands) {
                Interpreter.run({ obj: {}, client: this, command, data: command.compiled.code, environment });
            }
        }
    }
});