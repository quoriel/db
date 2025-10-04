const { NativeFunction } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$clearCache",
    description: "Clears all cached data from memory",
    version: "1.4.0",
    unwrap: false,
    execute(ctx) {
        cache.clear();
        return this.success();
    }
});