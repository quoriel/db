const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$getCache",
    version: "1.0.0",
    description: "Извлекает данные из кэша по переменной",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Имя переменной",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [name]) {
        return this.success(cache.get(name));
    }
});