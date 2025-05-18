const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$putVar",
    version: "1.0.0",
    description: "Устанавливает данные для сущности",
    output: ArgType.Boolean,
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
            name: "json",
            description: "Новые данные",
            type: ArgType.Json,
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
            name: "guild",
            description: "Идентификатор гильдии",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [type, json, entity, guild]) {
        const db = dbs.get(type);
        if (!config?.types?.[type] || !db || typeof json !== "object" || Array.isArray(json)) {
            return this.success(false);
        }
        const tupe = config.types[type].type;
        if (!entity) {
            if (tupe === null) {
                return this.success(false);
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[tupe].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        try {
            if (Object.keys(json).length) {
                await db.put(entity, json);
            } else {
                await db.remove(entity);
            }
            return this.success(true);
        } catch {
            return this.success(false);
        }
    }
});