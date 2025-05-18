const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$variables",
    version: "1.0.0",
    description: "Возвращает весь объект переменных по умолчанию",
    output: ArgType.Json,
    unwrap: true,
    execute(ctx) {
        return this.successJSON(variables);
    }
});