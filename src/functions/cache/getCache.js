const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$getCache",
    description: "Retrieves data from the cache by variable",
    version: "1.3.0",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Variable name",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [name]) {
        return this.success(cache.get(name));
    }
});