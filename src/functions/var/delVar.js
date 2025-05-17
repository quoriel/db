const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config, del } = require("../../db");

exports.default = new NativeFunction({
    name: "$delVar",
    version: "1.0.0",
    description: "Удаляет заданную переменную из указанной сущности",
    output: ArgType.Boolean,
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
            return this.success(false);
        }
        const db = dbs.get(type);
        if (!db) {
            return this.success(false);
        }
        if (!config.types[type].json) {
            return this.success(await del(db, type, name));
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
        return this.success(await del(db, type, name, entity));
    }
});