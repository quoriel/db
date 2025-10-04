const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    description: "Returns a list of active databases",
    version: "1.3.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        return this.successJSON(Array.from(dbs.keys()));
    }
});