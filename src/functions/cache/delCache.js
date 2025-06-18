const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$delCache",
    version: "1.0.0",
    description: "Deletes data from the cache by variable",
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