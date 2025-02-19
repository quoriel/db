const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums } = require("../../config");
const { ping } = require("../../db");

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
        return this.success(await ping(type));
    }
});