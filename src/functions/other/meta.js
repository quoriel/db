const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { config, variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$meta",
    version: "1.0.0",
    description: "Returns the config or default variables object",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "config or variables",
            type: ArgType.Enum,
            enum: {
                config: "config",
                variables: "variables"
            },
            required: true
        }
    ],
    execute(ctx, [type]) {
        return this.successJSON(type === "config" ? config : variables);
    }
});
