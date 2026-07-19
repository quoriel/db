const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { keysDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$keysDB",
    description: "Retrieves all keys from the database",
    version: "3.0.0",
    output: ArgType.String,
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
            name: "separator",
            description: "The separator",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [type, separator]) {
        return this.success(keysDB(type).join(separator || ", "));
    }
});