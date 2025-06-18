const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { update } = require("../../db");

exports.default = new NativeFunction({
    name: "$updateVar",
    version: "1.0.0",
    description: "Synchronizes data with config.json and variables.json files",
    output: ArgType.Boolean,
    unwrap: true,
    async execute(ctx) {
        return this.success(await update());
    }
});