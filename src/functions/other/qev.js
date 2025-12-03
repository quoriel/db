const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { qev } = require("../../db");

exports.default = new NativeFunction({
    name: "$qev",
    description: "Retrieves an environment value with fallback to variables defaults",
    version: "2.0.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "key",
            description: "The key to return its value",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    execute(ctx, [args]) {
        return this.successJSON(ctx.getEnvironmentKey(...args) || qev(args));
    }
});