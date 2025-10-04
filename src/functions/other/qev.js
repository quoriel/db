const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$qev",
    description: "Retrieves an environment value with fallback to variables defaults",
    version: "1.4.0",
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
        return this.successJSON(ctx.getEnvironmentKey(...args) || variables.get(args.slice(1).join(config.variableSeparator)));
    }
});