const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$hasCache",
    description: "Checks if a cache key exists",
    version: "2.0.0",
    output: ArgType.Boolean,
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
        return this.success(cache.has(name));
    }
});