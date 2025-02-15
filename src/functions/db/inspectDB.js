const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums } = require("../../config");
const { inspect } = require("../../db");

exports.default = new NativeFunction({
    name: "$inspectDB",
    version: "1.0.0",
    description: "Возвращает список всех записей из базы данных для указанного типа переменной",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип переменной",
            type: ArgType.Enum,
            enum: enums,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        return this.success(await inspect(type));
    }
});