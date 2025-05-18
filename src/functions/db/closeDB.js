const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$closeDB",
    version: "1.0.0",
    description: "Завершает соединение с базой данных",
    output: ArgType.Boolean,
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
        if (!config?.types?.[type]) {
            return this.success(false);
        }
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