const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$loadVar",
    version: "1.0.0",
    description: "Загружает значения переменных для указанной сущности и сохраняет их в переменную окружения",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "variable",
            description: "Переменная, в которую нужно загрузить",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "type",
            description: "Тип данных",
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
            name: "guild",
            description: "Идентификатор гильдии",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [variable, type, entity, guild]) {
        const db = dbs.get(type);
        if (!db) {
            return this.success();
        }
        const tupe = config.types[type].type;
        if (!entity) {
            if (tupe === null) {
                return this.success();
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[type].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        try {
            const data = await db.get(entity) || {};
            ctx.setEnvironmentKey(variable, data);
            return this.success();
        } catch {
            return this.success();
        }
    }
});