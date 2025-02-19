const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types } = require("../../config");
const { entry } = require("../../db");

exports.default = new NativeFunction({
    name: "$rankedVar",
    version: "1.0.0",
    description: "...",
    output: ArgType.Unknown,
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
            name: "position",
            description: "Позиция сущности",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "result",
            description: "Тип результата",
            type: ArgType.Enum,
            enum: enums.result,
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
    async execute(ctx, [type, name, position, result, sorting, guild]) {
    	if (!types[type].json) return this.success();
        const data = await entry(type, name, sorting, guild?.id || ctx.guild.id);
        return this.success(data.ranked[position - 1]?.[result]);
    }
});