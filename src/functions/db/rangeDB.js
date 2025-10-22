const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$rangeDB",
    description: "Retrieves all records from the database",
    version: "1.7.0",
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
        const db = dbs.get(type);
        if (!db) return this.successJSON([]);
        const results = [];
        try {
            for (const item of db.getRange()) results.push({ key: item.key, value: item.value });
            return this.successJSON(results);
        } catch (error) {
            Logger.error(error);
            return this.successJSON([]);
        }
    }
});