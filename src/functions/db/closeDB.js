const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { close, config } = require("../../db");

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
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        if (!config?.types?.[type]) return this.success(false);
        return this.success(await close(type));
    }
});