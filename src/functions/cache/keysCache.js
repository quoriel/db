const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$keysCache",
    description: "Returns all keys from the cache",
    version: "1.3.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        return this.successJSON(Array.from(cache.keys()));
    }
});