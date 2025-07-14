const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$fallbackVar",
    version: "1.0.0",
    description: "Loads merged data with default variables into an environment variable",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "variable",
            description: "Environment variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "json",
            description: "Data for merging",
            type: ArgType.Json,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [variable, json]) {
        ctx.setEnvironmentKey(variable, { ...variables, ...json });
        return this.success();
    }
});
