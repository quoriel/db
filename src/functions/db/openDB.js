const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config, path } = require("../../db");
const { open } = require("lmdb");
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$openDB",
    version: "1.0.0",
    description: "Opens a connection to one or more databases",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "types",
            description: "Data type(s)",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    execute(ctx, [types]) {
        const result = [];
        for (const type of types) {
            if (!config?.types?.[type]) {
                result.push(false);
                continue;
            }
            if (dbs.has(type)) {
                result.push(true);
                continue;
            }
            try {
                const db = open({
                    ...config.open,
                    path: join(path, type)
                });
                dbs.set(type, db);
                result.push(true);
            } catch {
                result.push(false);
            }
        }
        return this.successJSON(result);
    }
});