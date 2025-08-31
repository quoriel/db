const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, variables, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$valueVar",
    version: "1.2.0",
    description: "Retrieves a variable value from the database or returns a default value",
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
    async execute(ctx, [type, name, entity, guild]) {
        const db = dbs.get(type);
        if (!db) {
            return this.success(variables[name]);
        }
        const tupe = config.types[type].type
        if (!entity) {
            if (tupe === null) {
                return this.success(variables[name]);
            }
            entity = ctx[tupe]?.id;
        }
        if (config.types[type].guild) {
            entity = entity + config.separator + (guild?.id || ctx.guild.id);
        }
        try {
            const data = await db.get(entity) || {};
            return this.success(data[name] || variables[name]);
        } catch (error) {
            Logger.error(`Failed to get variable "${name}" for entity "${entity}" in database of type "${type}":\n`, error.message);
            return this.success(variables[name]);
        }
    }
});