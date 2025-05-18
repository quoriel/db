const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$pingDB",
    version: "1.0.0",
    description: "Проверяет время отклика от базы данных",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип данных",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        const db = dbs.get(type);
        if (!config?.types?.[type] || !db) {
            return this.success(-1);
        }
        const start = performance.now();
        try {
            await db.get("ping");
            return this.success(Math.round(performance.now() - start));
        } catch {
            return this.success(-1);
        }
    }
});