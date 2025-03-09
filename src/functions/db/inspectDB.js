const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types } = require("../../config");
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
            description: "Тип переменной",
            type: ArgType.Enum,
            enum: enums.type,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        const db = dbs.get(type);
        if (!db) return this.success("[]");
        const is = types[type].json;
        let result = "[";
        let first = true;
        try {
            for await (const { key, value } of db.getRange()) {
                first ? first = false : result += ",";
                result += '{"key":"' + key + '","value":' + (is ? value : JSON.stringify(value)) + '}';
            }
            return this.success(result + "]");
        } catch {
            return this.success("[]");
        }
    }
});
