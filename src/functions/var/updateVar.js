const { NativeFunction } = require("@tryforge/forgescript");
const { update } = require("../../db");

exports.default = new NativeFunction({
    name: "$updateVar",
    description: "Synchronizes data with config.json and variables.json files",
    version: "1.3.0",
    unwrap: false,
    async execute(ctx) {
        await update();
        return this.success();
    }
});