const { ForgeExtension } = require("@tryforge/forgescript");
const { update } = require("./db");
const pkg = require("../package.json");

class QuorielDB extends ForgeExtension {
    name = "QuorielDB";
    description = pkg.description;
    version = pkg.version;

    init() {
        update();
        this.load(__dirname + "/functions");
    }
}

exports.QuorielDB = QuorielDB;
