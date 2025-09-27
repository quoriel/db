const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$fallbackVar",
    description: "Merges input data with default variables and returns the result",
    version: "1.3.0",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "object",
            description: "Data for merging",
            type: ArgType.Json,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [object]) {
        return this.successJSON({ ...Object.fromEntries(variables), ...object });
    }
});