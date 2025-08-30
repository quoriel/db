const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { update } = require("../../db");

exports.default = new NativeFunction({
    name: "$updateVar",
    version: "1.2.0",
    description: "Synchronizes data with config.json and variables.json files",
    output: ArgType.Json,
    unwrap: true,
    async execute(ctx) {
        return this.successJSON(await update());
    }
});