const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types } = require("../../config");
const { entry } = require("../../db");

exports.default = new NativeFunction({
    name: "$lengthVar",
    version: "1.0.0",
    description: "Возвращает количество элементов в ранжированном списке",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип переменной",
            type: ArgType.Enum,
            enum: enums.type,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Имя переменной",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "sorting",
            description: "Тип сортировки",
            type: ArgType.Enum,
            enum: enums.sorting,
            rest: false
        },
        {
            name: "guild",
            description: "Идентификатор гильдии",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [type, name, sorting, guild]) {
    	if (!types[type].json) return this.success("0");
        const data = await entry(type, name, sorting, guild?.id || ctx.guild.id);
        return this.success(data.length);
    }
});
