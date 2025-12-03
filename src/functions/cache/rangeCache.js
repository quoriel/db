const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { cache } = require("../../db");

exports.default = new NativeFunction({
    name: "$rangeCache",
    description: "Retrieves all entries from the cache",
    version: "2.0.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        const result = [];
        for (const item of cache) result.push({ key: item[0], value: item[1] });
        return this.successJSON(result);
    }
});