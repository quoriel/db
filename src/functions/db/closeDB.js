const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$closeDB",
    version: "1.0.0",
    description: "Closes the connection to the database",
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
        }
    ],
    async execute(ctx, [type]) {
        const db = dbs.get(type);
        if (!db) {
            return this.success(true);
        }
        try {
            await db.close();
            dbs.delete(type);
            return this.success(true);
        } catch {
            return this.success(false);
        }
    }
});