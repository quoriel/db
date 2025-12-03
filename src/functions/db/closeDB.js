const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { closeDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$closeDB",
    description: "Closes the connection to one or more databases",
    version: "2.0.0",
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
    async execute(ctx, [array]) {
        await closeDB(array);
        return this.success();
    }
});