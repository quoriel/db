const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { activeDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    description: "Returns a list of active databases",
    version: "3.0.0",
    output: ArgType.String,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "separator",
            description: "The separator",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [separator]) {
        return this.success(activeDB().join(separator || ", "));
    }
});