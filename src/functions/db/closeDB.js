const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$closeDB",
    version: "1.0.0",
    description: "Closes the connection to one or more databases",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "types",
            description: "Data type(s)",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    async execute(ctx, [types]) {
        const results = [];
        for (const type of types) {
            const db = dbs.get(type);
            if (!db) {
                results.push(true);
                continue;
            }
            try {
                await db.close();
                dbs.delete(type);
                results.push(true);
            } catch {
                results.push(false);
            }
        }
        return this.successJSON(results);
    }
});