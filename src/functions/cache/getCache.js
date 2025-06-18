const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$getCache",
    version: "1.0.0",
    description: "Retrieves data from the cache by variable",
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
    async execute(ctx, [name]) {
        return this.success(cache.get(name));
    }
});