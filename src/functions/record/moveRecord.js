const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { moveRecord } = require("../../db");

exports.default = new NativeFunction({
    name: "$moveRecord",
    description: "Moves data from one record to another",
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
            name: "from key",
            description: "Source record key",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "to key",
            description: "Target record key",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "delete source",
            description: "Whether to delete source record after moving (default: true)",
            type: ArgType.Boolean,
            rest: false
        }
    ],
    async execute(ctx, [type, fromKey, toKey, deleteSource]) {
        return this.success(await moveRecord(type, fromKey, toKey, deleteSource));
    }
});