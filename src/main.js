const { ForgeExtension } = require("@tryforge/forgescript");
const { update } = require("./db");

class QuorielDB extends ForgeExtension {
    name = "QuorielDB";
    description = require("../package.json").description;
    version = require("../package.json").version;

    init() {
        update();
        this.load(__dirname + "/functions");
    }
}

exports.QuorielDB = QuorielDB;