const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$rangeDB",
    version: "1.2.0",
    description: "Retrieves all records from the database",
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
    async execute(ctx, [type]) {
        const db = dbs.get(type);
        if (!db) {
            return this.successJSON([]);
        }
        const results = [];
        try {
            for await (const { key, value } of db.getRange()) {
                results.push({ key, value });
            }
            return this.successJSON(results);
        } catch (error) {
            Logger.error(`Failed to retrieve entries for database of type "${type}":\n`, error.message);
            return this.successJSON([]);
        }
    }
});