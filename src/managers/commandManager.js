const { BaseCommandManager } = require("@tryforge/forgescript");

class CommandManager extends BaseCommandManager {
    handlerName = "QuorielDBEvents";
}

module.exports = { CommandManager };