const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config, path } = require("../../db");
const { open } = require("lmdb");
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
            description: "Тип данных",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [type]) {
        if (!config?.types?.[type]) return this.success(false);
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