const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums } = require("../../config");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$pingDB",
    version: "1.0.0",
    description: "Проверяет время отклика от базы данных и выводит пинг",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип переменной",
            type: ArgType.Enum,
            enum: enums.type,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        const db = dbs.get(type);
        if (!db) return this.success("-1");
        const start = performance.now();
        await db.get("ping");
        return this.success(Math.round(performance.now() - start));
    }
});
