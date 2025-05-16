const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { board, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$countBoard",
    version: "1.0.0",
    description: "Возвращает количество элементов в ранжированном списке",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип переменной",
            type: ArgType.String,
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
            enum: {
                asc: "asc",
                desc: "desc"
            },
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
        if (!config?.types?.[type]?.json) return this.success(0);
        const data = await board(type, name, sorting, guild?.id || ctx.guild.id);
        return this.success(data.count);
    }
});
