const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { activeDB } = require("../../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    description: "Returns a list of active databases",
    version: "2.0.0",
    output: ArgType.Json,
    unwrap: false,
    execute(ctx) {
        return this.successJSON(activeDB());
    }
});