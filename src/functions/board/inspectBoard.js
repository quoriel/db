const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, board, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$inspectBoard",
    version: "1.0.0",
    description: "Возвращает весь отсортированный ранжированный список",
    output: ArgType.Json,
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
        const db = dbs.get(type);
        if (!config?.types?.[type] || !db) {
            return this.successJSON({ items: [], count: 0 });
        }
        const data = await board(db, type, name, sorting, guild?.id || ctx.guild.id);
        return this.successJSON(data);
    }
});