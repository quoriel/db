const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$hold",
    description: "Applies a hold timer to prevent repeated actions",
    version: "1.7.3",
    brackets: true,
    unwrap: false,
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
            description: "Code to execute",
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
    async execute(ctx) {
        const type = await this["resolveUnhandledArg"](ctx, 0);
        if (!this["isValidReturnType"](type)) return type;
        const name = await this["resolveUnhandledArg"](ctx, 1);
        if (!this["isValidReturnType"](name)) return name;
        const duration = await this["resolveUnhandledArg"](ctx, 2);
        if (!this["isValidReturnType"](duration)) return duration;
        const entityV = await this["resolveUnhandledArg"](ctx, 4);
        if (!this["isValidReturnType"](entityV)) return entityV;
        const db = dbs.get(type.value);
        if (!db) return this.success();
        const view = types.get(type.value);
        let entity = entityV?.value;
        if (!entity) {
            if (view.type === null) return this.success();
            entity = ctx[view.type]?.id;
        }
        if (view.guild) {
            const guild = await this["resolveUnhandledArg"](ctx, 5);
            if (!this["isValidReturnType"](guild)) return guild;
            entity = entity + config.entitySeparator + (guild?.value?.id || ctx.guild.id);
        }
        try {
            let data = db.get(entity) || {};
            if (!data.holds) data.holds = {};
            const existing = data.holds[name.value];
            const now = Date.now();
            if (existing && existing > now) {
                const field = this.data.fields[3];
                if (field) {
                    const code = await this["resolveCode"](ctx, field);
                    if (!this["isValidReturnType"](code)) return code;
                    ctx.container.content = code.value;
                    await ctx.container.send(ctx.obj);
                }
                return this.stop();
            }
            data.holds[name.value] = now + duration.value;
            if (config.eventUpdate) {
                const old = db.get(entity);
                await db.put(entity, data);
                config.emitter.emit("recordUpdate", {
                    type: type.value,
                    key: entity,
                    value: { old, new: data }
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