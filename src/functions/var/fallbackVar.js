const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$fallbackVar",
    version: "1.0.0",
    description: "Merges input data with default variables and returns the result",
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
    async execute(ctx, [object]) {
        return this.successJSON({ ...variables, ...object });
    }
});