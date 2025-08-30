const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { log } = require("@quoriel/utils");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$delVar",
    version: "1.2.0",
    description: "Deletes the record of the specified entity",
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
        if (!db) {
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
            await db.remove(entity);
            return this.success(true);
        } catch (error) {
            log("ERROR", "delVar", `Failed to delete entity "${entity}" from database "${type}"`, error.message);
            return this.success(false);
        }
    }
});