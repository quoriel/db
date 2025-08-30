const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");
const { log } = require('@quoriel/utils');

exports.default = new NativeFunction({
    name: "$putVar",
    version: "1.0.0",
    description: "Sets new data for the entity",
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
        if (!db || object.constructor !== Object) {
            return this.success(false);
        }
        const tupe = config.types[type].type;
        if (!entity) {
            if (tupe === null) {
                return this.success(false);
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[type].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        try {
            if (Object.keys(object).length) {
                await db.put(entity, object);
            } else {
                await db.remove(entity);
            }
            return this.success(true);
        } catch (error) {
            log("ERROR", "putVar", `Database operation failed for entity "${entity}" in database "${type}"`, error.message);
            return this.success(false);
        }
    }
});