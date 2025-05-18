const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { update } = require("../../db");

exports.default = new NativeFunction({
    name: "$updateVar",
    version: "1.0.0",
    description: "Синхронизирует данные с файлами config.json и variables.json",
    output: ArgType.Boolean,
    unwrap: true,
    async execute(ctx) {
        return this.success(await update());
    }
});