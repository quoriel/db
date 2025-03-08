const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types, separator } = require("../../config");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$putVar",
    version: "1.0.0",
    description: "Устанавливает или обновляет значение переменной для сущности",
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
            name: "value",
            description: "Новое значение",
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
    async execute(ctx, [type, name, value, entity, guild]) {
        const db = dbs.get(type);
        if (!db) return this.success(false);
        if (!types[type].json) return this.success(await put(db, type, name, value));
        const tupe = types[type].type;
        if (tupe === null) return this.stop();
        entity ||= ctx[tupe]?.id;
        if (types[tupe].guild) entity = entity + separator + (guild?.id || ctx.guild.id);
        return this.success(await put(db, type, name, value, entity));
    }
});

async function put(db, type, name, value, entity) {
    const key = entity || name;
    try {
        if (!types[type].json) return value ? await db.put(key, value) : await db.remove(key);
        const current = await db.get(key);
        const data = current ? JSON.parse(current) : {};
        value ? data[name] = value : delete data[name];
        Object.keys(data).length ? await db.put(key, JSON.stringify(data)) : await db.remove(key);
        return true;
    } catch {
        return false;
    }
}