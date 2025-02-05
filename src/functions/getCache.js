const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../db");

exports.default = new NativeFunction({
    name: "$getCache",
    version: "1.0.0",
    description: "...",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "...",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    async execute(ctx, [name]) {
        return this.success(await cache.get(name));
    }
});