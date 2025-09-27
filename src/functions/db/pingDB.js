const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$pingDB",
    description: "Checks the database response time",
    version: "1.3.0",
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
        if (!db) return this.success(-1);
        const start = performance.now();
        try {
            db.get("ping");
            return this.success(Math.round(performance.now() - start));
        } catch (error) {
            Logger.error(error);
            return this.success(-1);
        }
    }
});