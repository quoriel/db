const { NativeFunction } = require("@tryforge/forgescript");
const { reloadDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$reloadDB",
    description: "Reloads database configuration from file",
    version: "3.0.0",
    unwrap: false,
    async execute(ctx) {
        await reloadDB();
        return this.success();
    }
});