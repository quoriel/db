const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, path } = require("../../db");
const { existsSync } = require("fs");
const { rm } = require("fs").promises;
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$wipeDB",
    version: "1.2.0",
    description: "Deletes the entire database",
    output: ArgType.Boolean,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [type]) {
        const db = dbs.get(type);
        const full = join(path, "types", type);
        try {
            if (db) {
                await db.close();
                dbs.delete(type);
            }
            if (existsSync(full)) {
                await rm(full, { recursive: true, force: true });
            }
            return this.success(true);
        } catch (error) {
            Logger.error(`Failed to wipe database of type "${type}":\n`, error.message);
            return this.success(false);
        }
    }
});