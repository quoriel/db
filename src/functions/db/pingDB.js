const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$pingDB",
    version: "1.0.0",
    description: "Checks the database response time",
    output: ArgType.Number,
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
            return this.success(-1);
        }
        const start = performance.now();
        try {
            await db.get("ping");
            return this.success(Math.round(performance.now() - start));
        } catch (error) {
            Logger.error(`Failed to ping database of type "${type}":\n`, error.message);
            return this.success(-1);
        }
    }
});