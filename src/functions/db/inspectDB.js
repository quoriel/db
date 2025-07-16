const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$inspectDB",
    version: "1.0.0",
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
        } catch {
            return this.successJSON([]);
        }
    }
});