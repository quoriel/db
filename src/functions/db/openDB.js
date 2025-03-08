const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { open } = require("lmdb");
const { enums, path } = require("../../config");
const { dbs } = require("../../db");
const { join } = require("path");

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
            enum: enums.type,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [type]) {
        if (dbs.has(type)) return this.success(true);
        try {
            const db = open({
                path: join(path, type),
                noReadAhead: true,
                noMemInit: true,
                compression: true,
                cache: true
            });
            dbs.set(type, db);
            return this.success(true);
        } catch {
            return this.success(false);
        }
    }
});