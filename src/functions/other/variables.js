const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { variables, getN } = require("../../db");

exports.default = new NativeFunction({
    name: "$variables",
    version: "1.0.0",
    description: "Возвращает значение переменной или весь объект переменных",
    output: ArgType.Unknown,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "name",
            description: "Имя переменной",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx, [name]) {
        const value = name ? getN(variables, name) : variables;
        return this.success(typeof value === "object" ? JSON.stringify(value) : value);
    }
});