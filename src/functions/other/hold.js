const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$hold",
    description: "Applies a hold timer to prevent repeated actions",
    version: "1.7.0",
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
            name: "name",
            description: "Hold name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "duration",
            description: "Hold duration",
            type: ArgType.Time,
            required: true,
            rest: false
        },
        {
            name: "code",
            description: "Code for execution",
            type: ArgType.String,
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
    async execute(ctx, [type, name, duration, code, entity, guild]) {
        const db = dbs.get(type);
        if (!db) return this.success();
        const view = types.get(type);
        if (!entity) {
            if (view.type === null) return this.success();
            entity = ctx[view.type]?.id;
        }
        if (view.guild) entity = entity + config.entitySeparator + (guild?.id || ctx.guild.id);
        try {
            let data = db.get(entity) || {};
            if (!data.holds) data.holds = {};
            const existing = data.holds[name];
            if (existing && existing > Date.now()) {
                if (code) {
                    ctx.container.content = code;
                    await ctx.container.send(ctx.obj);
                }
                return this.stop();
            }
            data.holds[name] = Date.now() + duration;
            if (config.eventUpdate) {
                const old = db.get(entity);
                await db.put(entity, data);
                config.emitter.emit("recordUpdate", {
                    type,
                    key: entity,
                    value: {
                        old,
                        new: data
                    }
                });
            } else {
                await db.put(entity, data);
            }
            return this.success();
        } catch (error) {
            Logger.error(error);
            return this.success();
        }
    }
});