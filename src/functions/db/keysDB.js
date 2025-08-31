const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$keysDB",
    version: "1.2.0",
    description: "Retrieves all keys from the database",
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
            for (const key of db.getKeys()) {
                results.push(key);
            }
            return this.successJSON(results);
        } catch (error) {
            Logger.error(error);
            return this.successJSON([]);
        }
    }
});