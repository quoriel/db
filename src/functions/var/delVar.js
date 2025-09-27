const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, types, separator } = require("../../db");

exports.default = new NativeFunction({
    name: "$delVar",
    description: "Deletes the record of the specified entity",
    version: "1.3.0",
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
    async execute(ctx, [type, entity, guild]) {
        const db = dbs.get(type);
        if (!db) return this.success(false);
        const view = types.get(type);
        if (!entity) {
            if (view.type === null) return this.success(false);
            entity = ctx[view.type]?.id;
        }
        if (view.guild) entity = entity + separator + (guild?.id || ctx.guild.id);
        try {
            await db.remove(entity);
            return this.success(true);
        } catch (error) {
            Logger.error(error);
            return this.success(false);
        }
    }
});