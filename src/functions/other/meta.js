const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { config, variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$meta",
    version: "1.0.0",
    description: "Возвращает объект конфигурации или переменных по умолчанию",
    output: ArgType.Json,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "config или variables",
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