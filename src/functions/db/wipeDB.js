const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums } = require("../../config");
const { wipe } = require("../../db");

exports.default = new NativeFunction({
    name: "$wipeDB",
    version: "1.0.0",
    description: "Полностью стирает данные указанной базы данных без возможности восстановления",
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
        return this.success(await wipe(type));
    }
});