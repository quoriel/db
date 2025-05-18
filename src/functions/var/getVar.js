const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, variables, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$getVar",
    version: "1.0.0",
    description: "Получает все данные, связанной с сущностью",
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
            name: "merge",
            description: "Объединить данные с переменными по умолчанию",
            type: ArgType.Boolean,
            rest: false
        },
        {
            name: "entity",
            description: "Идентификатор сущности",
            type: ArgType.String,
            rest: false
        },
        {
            name: "guild",
            description: "Идентификатор гильдии",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [type, merge, entity, guild]) {
        const db = dbs.get(type);
        if (!config?.types?.[type] || !db) {
            return this.successJSON({});
        }
        const tupe = config.types[type].type;
        if (!entity) {
            if (tupe === null) {
                return this.successJSON({});
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[tupe].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        try {
            const data = await db.get(entity) || {};
            return this.successJSON(merge ? { ...variables, ...data } : data);
        } catch {
            return this.successJSON({});
        }
    }
});