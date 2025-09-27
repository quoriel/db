const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$putCache",
    description: "Puts data into the cache by the specified variable",
    version: "1.0.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "value",
            description: "New value",
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