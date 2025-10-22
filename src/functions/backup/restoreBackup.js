const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { promises: { access, cp } } = require("fs");
const { dbs, path, types } = require("../../db");
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$restoreBackup",
    description: "Restores database from backup if the database is not active",
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
        if (!types.has(type) || dbs.has(type)) return this.success(false);
        const db = join(path, "types", type);
        try {
            await access(db);
            return this.success(false);
        } catch {
            // it just works ¯\_(ツ)_/¯
        }
        const backup = join(path, "backups", type);
        try {
            await access(backup);
        } catch {
            return this.success(false);
        }
        try {
            await cp(backup, db, { recursive: true });
            return this.success(true);
        } catch (error) {
            Logger.error(error);
            return this.success(false);
        }
    }
});