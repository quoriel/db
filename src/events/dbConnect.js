const { Interpreter } = require("@tryforge/forgescript");
const { EventHandler } = require("../managers/eventHandler");
const { QuorielDB } = require("../main");

exports.default = new EventHandler({
    name: "dbConnect",
    description: "Called when QuorielDB connects to ForgeScript",
    version: "1.4.0",
    listener() {
        const commands = this.getExtension(QuorielDB, true).commands.get("dbConnect");
        if (commands) {
            for (const command of commands) {
                Interpreter.run({ obj: {}, client: this, command, data: command.compiled.code });
            }
        }
    }
});