const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { config, variables } = require("../../db");

const InternalType = {
    config: "config",
    variables: "variables"
};

exports.default = new NativeFunction({
    name: "$internal",
    version: "1.1.0",
    description: "Returns the config or default variables object",
    output: ArgType.Json,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "config or variables",
            type: ArgType.Enum,
            enum: InternalType,
            required: true
        }
    ],
    execute(ctx, [type]) {
        return this.successJSON(type === "config" ? config : variables);
    }
});