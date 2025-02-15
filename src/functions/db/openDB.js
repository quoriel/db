const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums } = require("../../config");
const { open } = require("../../db");

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
    execute(ctx, [type]) {
        return this.success(open(type));
    }
});