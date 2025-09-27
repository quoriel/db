const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables, types, separator, flags } = require("../../db");

const InternalType = {
    config: "config",
    variables: "variables"
};

exports.default = new NativeFunction({
    name: "$internal",
    description: "Returns the config or default variables object",
    version: "1.3.0",
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
        return this.successJSON(type === "config" ? { types: Object.fromEntries(types), separator, flags } : Object.fromEntries(variables));
    }
});