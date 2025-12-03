const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, removeRecord } = require("../../db");

exports.default = new NativeFunction({
    name: "$removeRecord",
    description: "Deletes the record of the specified key",
    version: "2.0.0",
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
            name: "key",
            description: "Record key",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx, [type, key]) {
        await removeRecord(type, key || autoKey(ctx, type));
        return this.success();
    }
});