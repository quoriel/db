const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$moveRecord",
    description: "Moves data from one entity to another",
    version: "1.6.0",
    output: ArgType.Boolean,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "from entity",
            description: "Source entity identifier",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "to entity",
            description: "Target entity identifier",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "from guild",
            description: "Source guild identifier",
            type: ArgType.Guild,
            rest: false
        },
        {
            name: "to guild",
            description: "Target guild identifier",
            type: ArgType.Guild,
            rest: false
        },
        {
            name: "delete source",
            description: "Whether to delete source record after moving (default: true)",
            type: ArgType.Boolean,
            rest: false
        }
    ],
    async execute(ctx, [type, fromEntity, toEntity, fromGuild, toGuild, deleteSource]) {
        const db = dbs.get(type);
        if (!db) return this.success(false);
        if (types.get(type).guild) {
            fromEntity = fromEntity + config.entitySeparator + (fromGuild?.id || ctx.guild.id);
            toEntity = toEntity + config.entitySeparator + (toGuild?.id || ctx.guild.id);
        }
        try {
            const data = db.get(fromEntity);
            if (!data) return this.success(false);
            if (config.eventUpdate) {
                const old = db.get(toEntity);
                await db.put(toEntity, data);
                config.emitter.emit("recordUpdate", {
                    type,
                    key: toEntity,
                    value: {
                        old,
                        new: data
                    }
                });
            } else {
                await db.put(toEntity, data);
            }
            if (deleteSource !== false) {
                if (config.eventRemove) {
                    await db.remove(fromEntity);
                    config.emitter.emit("recordRemove", {
                        type,
                        key: fromEntity,
                        value: data
                    });
                } else {
                    await db.remove(fromEntity);
                }
            }
            return this.success(true);
        } catch (error) {
            Logger.error(error);
            return this.success(false);
        }
    }
});