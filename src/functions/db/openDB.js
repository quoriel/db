const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, path, types, flags } = require("../../db");
const { open } = require("lmdb");
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$openDB",
    description: "Opens a connection to one or more databases",
    version: "1.3.0",
    output: ArgType.Number,
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
    execute(ctx, [array]) {
        let count = 0;
        for (const type of array) {
            if (!types.has(type)) continue;
            if (dbs.has(type)) {
                count++;
                continue;
            }
            try {
                const db = open({
                    ...flags,
                    path: join(path, "types", type)
                });
                dbs.set(type, db);
                count++;
            } catch (error) {
                Logger.error(error);
            }
        }
        return this.success(count);
    }
});