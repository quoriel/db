const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, getRecord } = require("../../db");

exports.default = new NativeFunction({
    name: "$getRecord",
    description: "Retrieves or loads record data into environment",
    version: "2.0.0",
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
        const value = getRecord(type, key || autoKey(ctx, type));
        if (variable) {
            ctx.setEnvironmentKey(variable, value);
            return this.success();
        }
        return this.successJSON(value);
    }
});