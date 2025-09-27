const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, path } = require("../../db");
const { promises: { rm } } = require("fs");
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$wipeDB",
    description: "Deletes the entire database",
    version: "1.3.0",
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
        if (db) {
            await db.close();
            dbs.delete(type);
        }
        await rm(full, { recursive: true, force: true });
        return this.success();
    }
});