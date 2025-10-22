const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { promises: { rm } } = require("fs");
const { path } = require("../../db");
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$removeBackup",
    description: "Removes a backup of the specified data type",
    version: "1.7.0",
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
        await rm(join(path, "backups", type), { recursive: true, force: true });
        return this.success();
    }
});