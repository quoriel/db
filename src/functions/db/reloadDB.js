const { NativeFunction } = require("@tryforge/forgescript");
const { reloadDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$reloadDB",
    description: "Reloads database configuration and variables from files",
    version: "2.0.0",
    unwrap: false,
    async execute(ctx) {
        await reloadDB();
        return this.success();
    }
});