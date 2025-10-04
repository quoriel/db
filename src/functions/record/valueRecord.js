const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, variables, types, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$valueRecord",
    description: "Gets a variable value from a record",
    version: "1.4.0",
    output: ArgType.Unknown,
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
            description: "Variable name",
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
    execute(ctx, [type, name, entity, guild]) {
        const db = dbs.get(type);
        if (!db) return this.success(variables.get(name));
        const view = types.get(type);
        if (!entity) {
            if (view.type === null) return this.success(variables.get(name));
            entity = ctx[view.type]?.id;
        }
        if (view.guild) entity = entity + config.entitySeparator + (guild?.id || ctx.guild.id);
        try {
            return this.success((db.get(entity) || {})[name] || variables.get(name));
        } catch (error) {
            Logger.error(error);
            return this.success(variables.get(name));
        }
    }
});