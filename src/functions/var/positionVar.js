const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types } = require("../../config");
const { entry } = require("../../db");

exports.default = new NativeFunction({
    name: "$positionVar",
    version: "1.0.0",
    description: "Возвращает позицию указанной сущности в ранжированном списке",
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
            name: "entity",
            description: "Идентификатор сущности",
            type: ArgType.String,
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
    async execute(ctx, [type, name, entity, sorting, guild]) {
    	if (!types[type].json) return this.success();
        const tupe = types[type].type;
        if (tupe === null) return this.success();
        entity ||= ctx[tupe]?.id;
        const data = await entry(type, name, sorting, guild?.id || ctx.guild.id);
        const index = data.ranked.findIndex(item => item.entity === entity);
        return this.success(index + 1);
    }
});