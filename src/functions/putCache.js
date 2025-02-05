const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../db");

exports.default = new NativeFunction({
    name: "$putCache",
    version: "1.0.0",
    description: "...",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "...",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "...",
            type: ArgType.String,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [name, value]) {
        cache.set(name, value);
        return this.success();
    }
});