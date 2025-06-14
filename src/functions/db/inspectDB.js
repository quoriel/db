const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$inspectDB",
    version: "1.0.0",
    description: "Получение всех записей из базы данных",
    output: ArgType.Json,
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
        if (!db) {
            return this.successJSON([]);
        }
        const result = [];
        try {
            for await (const { key, value } of db.getRange()) {
                result.push({ key, value });
            }
            return this.successJSON(result);
        } catch {
            return this.successJSON([]);
        }
    }
});
