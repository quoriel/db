const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { createBackup } = require("../../db")

exports.default = new NativeFunction({
    name: "$createBackup",
    description: "Creates a backup of the specified database",
    version: "2.0.0",
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
        await createBackup(type);
        return this.success();
    }
});