const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$keysDB",
    version: "1.0.0",
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
        const result = [];
        try {
            for (const key of db.getKeys()) {
                result.push(key);
            }
            return this.successJSON(result);
        } catch {
            return this.successJSON([]);
        }
    }
});