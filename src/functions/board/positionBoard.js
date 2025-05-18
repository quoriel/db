const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, board, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$positionBoard",
    version: "1.0.0",
    description: "Возвращает позицию указанной сущности в ранжированном списке",
    output: ArgType.Number,
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
            name: "entity",
            description: "Идентификатор сущности",
            type: ArgType.String,
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
    async execute(ctx, [type, name, entity, sorting, guild]) {
        const db = dbs.get(type);
        if (!config?.types?.[type] || !db) {
            return this.success(0);
        }
        const tupe = config.types[type].type;
        if (!entity) {
            if (tupe === null) {
                return this.success(0);
            }
            entity = ctx[tupe]?.id;
        }
        const data = await board(db, type, name, sorting, guild?.id || ctx.guild.id);
        for (let i = 0; i < data.items.length; i++) {
            if (data.items[i].entity === entity) {
                return this.success(i + 1);
            }
        }
        return this.success(0);
    }
});