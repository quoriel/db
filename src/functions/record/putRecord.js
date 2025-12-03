const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, putRecord } = require("../../db");

exports.default = new NativeFunction({
    name: "$putRecord",
    description: "Sets new data for the key",
    version: "2.0.0",
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
            name: "value",
            description: "Object or environment variable name",
            type: ArgType.Json,
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
    async execute(ctx, [type, value, key]) {
        return this.success(await putRecord(type, key || autoKey(ctx, type), typeof value === "string" ? ctx.getEnvironmentKey(value) : value));
    }
});