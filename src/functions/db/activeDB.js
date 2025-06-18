const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    version: "1.0.0",
    description: "Returns a list of active databases",
    output: ArgType.Unknown,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "separator",
            description: "For separating active databases",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [separator]) {
        const active = Array.from(dbs.keys());
        return this.success(active.join(separator || ', '));
    }
});