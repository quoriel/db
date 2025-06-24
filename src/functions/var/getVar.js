const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$getVar",
    version: "1.0.0",
    description: "Gets all data associated with the entity",
    output: ArgType.Json,
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
            return this.successJSON({});
        }
        const tupe = config.types[type].type
        if (!entity) {
            if (tupe === null) {
                return this.successJSON({});
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[type].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        try {
            const data = await db.get(entity) || {};
            return this.successJSON(data);
        } catch {
            return this.successJSON({});
        }
    }
});