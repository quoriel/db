const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { existsSync } = require("fs");
const { rm } = require("fs").promises;
const { enums, path } = require("../../config");
const { close } = require("../../db");
const { join } = require("path");

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
        const full = join(path, type);
        await close(type);
        try {
            if (existsSync(full)) {
                await rm(full, { recursive: true, force: true });
            }
            return this.success(true);
        } catch {
            return this.success(false);
        }
    }
});