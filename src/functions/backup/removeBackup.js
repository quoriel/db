const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { removeBackup } = require("../../db");

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
        await removeBackup(type);
        return this.success();
    }
});