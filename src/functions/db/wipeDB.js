const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, close, config, path } = require("../../db");
const { existsSync } = require("fs");
const { rm } = require("fs").promises;
const { join } = require("path");

exports.default = new NativeFunction({
    name: "$wipeDB",
    version: "1.0.0",
    description: "Удаляет либо всю базу данных, либо данные текущей сущности",
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
            name: "mode",
            description: "Тип очистки",
            type: ArgType.Enum,
            enum: {
                all: "all",
                entity: "entity"
            },
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
    async execute(ctx, [type, mode, entity, guild]) {
        if (!config?.types?.[type]) {
            return this.success(false);
        }
        try {
            if (mode === "entity") {
                const db = dbs.get(type);
                if (!db || !config.types[type].json) {
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
                await db.remove(entity);
                return this.success(true);
            }
            const full = join(path, type);
            await close(type);
            if (existsSync(full)) {
                await rm(full, { recursive: true, force: true });
            }
            return this.success(true);
        } catch {
            return this.success(false);
        }
    }
});