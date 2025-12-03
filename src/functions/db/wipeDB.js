const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { wipeDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$wipeDB",
    description: "Deletes one or more databases",
    version: "2.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type(s)",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    async execute(ctx, [array]) {
        await wipeDB(array);
        return this.success();
    }
});