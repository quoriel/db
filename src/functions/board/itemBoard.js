const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, board, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$itemBoard",
    version: "1.0.0",
    description: "Возвращает данные из ранжированного списка по указанной позиции",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип данных",
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
            enum: {
                entity: "entity",
                value: "value"
            },
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
    async execute(ctx, [type, name, position, result, sorting, guild]) {
        const db = dbs.get(type);
        if (!config?.types?.[type]?.json || !db) {
            return this.success();
        }
        const data = await board(db, type, name, sorting, guild?.id || ctx.guild.id);
        return this.success(data.items[position - 1]?.[result]);
    }
});
