const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { rangeDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$rangeDB",
    description: "Retrieves all records from the database",
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
        return this.successJSON(rangeDB(type));
    }
});