const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    version: "1.0.0",
    description: "Returns a list of active databases",
    output: ArgType.Json,
    unwrap: true,
    execute(ctx) {
        return this.successJSON(Array.from(dbs.keys()));
    }
});