const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { keysDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$keysDB",
    description: "Retrieves all keys from the database",
    version: "2.0.0",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [type]) {
        return this.successJSON(keysDB(type));
    }
});