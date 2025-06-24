const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$keysCache",
    version: "1.0.0",
    description: "Returns all keys from the cache",
    output: ArgType.Json,
    unwrap: true,
    execute(ctx) {
        return this.successJSON(Array.from(cache.keys()));
    }
});