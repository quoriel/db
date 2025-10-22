const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { promises: { mkdir, rm } } = require("fs");
const { dbs, path } = require("../../db");
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$createBackup",
    description: "Creates a backup of the specified database",
    version: "1.7.0",
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
        if (!db) return this.success(false);
        const full = join(path, "backups", type);
        try {
            await rm(full, { recursive: true, force: true });
            await mkdir(full, { recursive: true });
            await db.backup(full);
            return this.success(true);
        } catch (error) {
            Logger.error(error);
            return this.success(false);
        }
    }
});