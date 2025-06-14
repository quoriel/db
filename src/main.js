const { ForgeExtension } = require("@tryforge/forgescript");
const { update } = require("./db");
const package = require("../package.json");

class QuorielDB extends ForgeExtension {
    name = "QuorielDB";
    description = package.description;
    version = package.version;

    init() {
        update();
        this.load(__dirname + "/functions");
    }
}

exports.QuorielDB = QuorielDB;