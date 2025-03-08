const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types, separator } = require("../../config");
const { dbs } = require("../../db");

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
            type: ArgType.Enum,
            enum: enums.type,
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
        const db = dbs.get(type);
        if (!db) return this.success(false);
        if (!types[type].json) return this.success(await del(db, type, name));
        const tupe = types[type].type;
        if (tupe === null) return this.stop();
        entity ||= ctx[tupe]?.id;
        if (types[tupe].guild) entity = entity + separator + (guild?.id || ctx.guild.id);
        return this.success(await del(db, type, name, entity));
    }
});

async function del(db, type, name, entity) {
    const key = entity || name;
    try {
        if (!types[type].json) return await db.remove(key);
        const current = await db.get(key);
        if (!current) return true;
        const data = JSON.parse(current);
        if (!(name in data)) return true;
        delete data[name];
        Object.keys(data).length ? await db.put(key, JSON.stringify(data)) : await db.remove(key);
        return true;
    } catch {
        return false;
    }
}