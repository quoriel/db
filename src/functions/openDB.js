const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { open } = require("../db");
const { enums } = require("../config");

exports.default = new NativeFunction({
    name: "$openDB",
    version: "1.0.0",
    description: "Открывает соединение с базой данных",
    output: ArgType.Boolean,
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
        return this.success(await open(type));
    }
});
