const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$existsRecord",
    description: "Checks if a record exists for the entity",
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
    execute(ctx, [type, entity, guild]) {
        const db = dbs.get(type);
        if (!db) return this.success(false);
        const view = types.get(type);
        if (!entity) {
            if (view.type === null) return this.success(false);
            entity = ctx[view.type]?.id;
        }
        if (view.guild) entity = entity + config.entitySeparator + (guild?.id || ctx.guild.id);
        return this.success(db.doesExist(entity));
    }
});