const { ForgeExtension } = require("@tryforge/forgescript");
const { description, version } = require("../package.json");
const { update } = require("./db");

class QuorielDB extends ForgeExtension {
    name = "QuorielDB";
    description = description;
    version = version;

    init() {
        update();
        this.load(__dirname + "/functions");
    }
}

module.exports = { QuorielDB };