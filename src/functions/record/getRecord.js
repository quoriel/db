const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, getRecord } = require("../../db");

exports.default = new NativeFunction({
    name: "$getRecord",
    description: "Retrieves record data or saves it into an environment variable",
    version: "3.1.0",
    output: ArgType.Unknown,
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
        const data = getRecord(type, key || autoKey(ctx, type));
        if (!variable) return this.successJSON(data);
        ctx.setEnvironmentKey(variable, data);
        return this.success();
    }
});