const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { openDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$openDB",
    description: "Opens a connection to one or more databases",
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
    execute(ctx, [array]) {
        openDB(array);
        return this.success();
    }
});