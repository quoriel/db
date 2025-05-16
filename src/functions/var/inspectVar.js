const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config, variables } = require("../../db");

exports.default = new NativeFunction({
    name: "$inspectVar",
    version: "1.0.0",
    description: "Возвращает все переменные, установленные для указанной сущности",
    output: ArgType.Json,
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
            name: "merge",
            description: "Объединять данные с переменными по умолчанию",
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
        if (!config?.types?.[type]) return this.successJSON({});
        const db = dbs.get(type);
        if (!db || !config.types[type].json) return this.successJSON({});
        const tupe = config.types[type].type;
        if (tupe === null) return this.successJSON({});
        entity ||= ctx[tupe]?.id;
        if (config.types[tupe].guild) entity = entity + config.separator + (guild?.id || ctx.guild.id);
        try {
            const raw = await db.get(entity);
            const object = raw ? JSON.parse(raw) : {};
            const result = merge ? { ...variables, ...object } : object;
            return this.successJSON(JSON.stringify(result));
        } catch {
            return this.successJSON({});
        }
    }
});