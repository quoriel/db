const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums } = require("../../config");
const { close } = require("../../db");

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
            description: "Тип переменной",
            type: ArgType.Enum,
            enum: enums.type,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        return this.success(await close(type));
    }
});