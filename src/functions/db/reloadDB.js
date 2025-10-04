const { NativeFunction } = require("@tryforge/forgescript");
const { reload } = require("../../db");

exports.default = new NativeFunction({
    name: "$reloadDB",
    description: "Reloads database configuration and variables from files",
    version: "1.4.0",
    unwrap: false,
    async execute(ctx) {
        await reload();
        return this.success();
    }
});