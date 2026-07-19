const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, putRecord } = require("../../db");

exports.default = new NativeFunction({
    name: "$putRecord",
    description: "Sets new data for the key",
    version: "3.0.0",
    output: ArgType.Boolean,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "variable",
            description: "Environment variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "key",
            description: "Record key",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx, [type, variable, key]) {
        return this.success(await putRecord(type, key || autoKey(ctx, type), ctx.getEnvironmentKey(variable)));
    }
});