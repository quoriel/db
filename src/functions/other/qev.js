const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$qev",
    description: "Retrieves an environment value with fallback to variables defaults",
    version: "1.5.0",
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
        return this.successJSON(ctx.getEnvironmentKey(...args) || parse(args));
    }
});

function parse(args) {
    const len = args.length;
    if (len === 1) return;
    if (len === 2) return variables.get(args[1]);
    let key = args[1];
    const sep = config.variableSeparator;
    for (let i = 2; i < len; i++) key += sep + args[i];
    return variables.get(key);
}