const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, path } = require("../../db");
const { mkdir, rm } = require("fs").promises;
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$backupDB",
    version: "1.2.0",
    description: "Creates a backup of the specified database",
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
        if (!db) {
            return this.success(false);
        }
        const target = join(path, "backups", type);
        try {
            await rm(target, { recursive: true, force: true });
            await mkdir(target, { recursive: true });
            await db.backup(target);
            return this.success(true);
        } catch (error) {
            Logger.error(error);
            return this.success(false);
        }
    }
});