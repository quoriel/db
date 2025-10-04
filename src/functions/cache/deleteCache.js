const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$deleteCache",
    description: "Deletes data from the cache by variable",
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
        }
    ],
    execute(ctx, [name]) {
        cache.delete(name);
        return this.success();
    }
});