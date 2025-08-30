const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config, path } = require("../../db");
const { log } = require('@quoriel/utils');
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
        const results = [];
        for (const type of types) {
            if (!config?.types?.[type]) {
                results.push(false);
                continue;
            }
            if (dbs.has(type)) {
                results.push(true);
                continue;
            }
            try {
                const db = open({
                    ...config.open,
                    path: join(path, "types", type)
                });
                dbs.set(type, db);
                results.push(true);
            } catch (error) {
                log("ERROR", "openDB", `Failed to open database "${type}"`, error.message);
                results.push(false);
            }
        }
        return this.successJSON(results);
    }
});