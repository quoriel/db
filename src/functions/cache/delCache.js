const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$delCache",
    version: "1.0.0",
    description: "Удаляет данные из кэша по переменной",
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
    execute(ctx, [name]) {
        cache.delete(name);
        return this.success();
    }
});