const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

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
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        if (!config?.types?.[type]) return this.successJSON([]);
        const db = dbs.get(type);
        if (!db) return this.successJSON([]);
        const is = config.types[type].json;
        let result = "[";
        let first = true;
        try {
            for await (const { key, value } of db.getRange()) {
                first ? first = false : result += ",";
                result += '{"key":"' + key + '","value":' + (is ? value : JSON.stringify(value)) + '}';
            }
            return this.successJSON(result + "]");
        } catch {
            return this.successJSON([]);
        }
    }
});