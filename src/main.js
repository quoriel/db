const { ForgeExtension, EventManager } = require("@tryforge/forgescript");
const { description, version } = require("../package.json");
const { CommandManager } = require("./managers/commandManager");
const { Emitter } = require("@eolthar/events");

const db = require("./db");
const { init, qev, ...functions } = db;

class QuorielDB extends ForgeExtension {
    name = "QuorielDB";
    description = description;
    version = version;
    emitter = new Emitter();
    commands;

    constructor(options) {
        super();
        this.options = options;
    }

    async init(client) {
        this.commands = new CommandManager(client);
        this.load(__dirname + "/functions");
        EventManager.load("QuorielDBEvents", __dirname + "/events");
        if (this.options?.events?.length) {
            client.events.load("QuorielDBEvents", this.options.events);
        }
        await init(this.emitter, this.options?.events);
    }
}

module.exports = { QuorielDB, ...functions };
