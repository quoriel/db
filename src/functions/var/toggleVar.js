const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types, separator } = require("../../config");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$toggleVar",
    version: "1.0.0",
    description: "Переключает значение переменной: если было true, станет false, и наоборот",
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
        const db = await dbs.get(type);
        if (!db) return this.success(false);
        if (!types[type].json) return this.success(await toggle(db, type, name));
        const tupe = types[type].type;
        if (tupe === null) return this.stop();
        entity ||= ctx[tupe]?.id;
        if (types[tupe].guild) entity = entity + separator + (guild?.id || ctx.guild.id);
        return this.success(await toggle(db, type, name, entity));
    }
});

async function toggle(db, type, name, entity) {
    const key = entity || name;
    try {
        const current = await db.get(key);
        if (types[type].json) {
            const data = JSON.parse(current || "{}");
            const value = data[name] === "true" ? "false" : "true";
            data[name] = value;
            await db.put(key, JSON.stringify(data));
            return value;
        } else {
            const value = current === "true" ? "false" : "true";
            await db.put(key, value);
            return value;
        }
    } catch {
        return false;
    }
}