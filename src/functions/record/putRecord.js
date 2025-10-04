const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$putRecord",
    description: "Sets new data for the entity",
    version: "1.4.0",
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
            name: "object",
            description: "New data object",
            type: ArgType.Json,
            required: true,
            rest: false
        },
        {
            name: "entity",
            description: "Entity identifier",
            type: ArgType.String,
            rest: false
        },
        {
            name: "guild",
            description: "Guild identifier",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [type, object, entity, guild]) {
        const db = dbs.get(type);
        if (!db || object.constructor !== Object) return this.success(false);
        const view = types.get(type);
        if (!entity) {
            if (view.type === null) return this.success(false);
            entity = ctx[view.type]?.id;
        }
        if (view.guild) entity = entity + config.entitySeparator + (guild?.id || ctx.guild.id);
        try {
            if (config.eventUpdate) {
                const old = db.get(entity) || {};
                await db.put(entity, object);
                config.emitter.emit("recordUpdate", {
                    type,
                    key: entity,
                    value: {
                        old,
                        new: object
                    }
                });
            } else {
                await db.put(entity, object);
            }
            return this.success(true);
        } catch (error) {
            Logger.error(error);
            return this.success(false);
        }
    }
});