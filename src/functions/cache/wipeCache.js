const { NativeFunction } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$wipeCache",
    description: "Clears all cached data from memory",
    version: "1.3.0",
    unwrap: false,
    execute(ctx) {
        cache.clear();
        return this.success();
    }
});