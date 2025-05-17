const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, variables, config, get, getJson } = require("../../db");

exports.default = new NativeFunction({
    name: "$getVar",
    version: "1.0.0",
    description: "Получает значение переменной, связанной с сущностью",
    output: ArgType.Unknown,
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
    async execute(ctx, [type, name, entity, guild]) {
        if (!config?.types?.[type]) {
            return this.success(getJson(variables, name));
        }
        const db = dbs.get(type);
        if (!db) {
            return this.success(getJson(variables, name));
        }
        if (!config.types[type].json) {
            return this.success(await get(db, type, name));
        }
        const tupe = config.types[type].type;
        if (!entity) {
            if (tupe === null) {
                return this.success(getJson(variables, name));
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[tupe].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        return this.success(await get(db, type, name, entity));
    }
});