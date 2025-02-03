const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { update } = require("../db");

exports.default = new NativeFunction({
    name: "$updateVar",
    version: "1.0.0",
    description: "Обновляет значения переменных, синхронизируя их с файлом variables.json",
    output: ArgType.Boolean,
    unwrap: true,
    async execute(ctx) {
        return this.success(await update());
    }
});
