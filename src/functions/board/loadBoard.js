const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

const sortType = {
    asc: "asc",
    desc: "desc"
};

exports.default = new NativeFunction({
    name: "$loadBoard",
    description: "Loads the entire sorted ranked list into the environment variable",
    version: "1.3.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "variable",
            description: "Environment variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
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
            name: "sorting",
            description: "Sorting type",
            type: ArgType.Enum,
            enum: sortType,
            rest: false
        },
        {
            name: "guild",
            description: "Guild identifier",
            type: ArgType.Guild,
            rest: false
        }
    ],
    execute(ctx, [variable, type, name, sorting, guild]) {
        const db = dbs.get(type);
        if (!db) return this.success();
        const is = types.get(type).guild;
        guild = guild?.id || ctx.guild.id;
        const items = [];
        try {
            for (const { key, value } of db.getRange()) {
                const [entityID, guildID] = key.split(config.entitySeparator);
                if (is && guildID !== guild) continue;
                const numeric = Number(value[name]);
                if (isNaN(numeric)) continue;
                items.push({ key: entityID, value: numeric });
            }
        } catch (error) {
            Logger.error(error);
            return this.success();
        }
        items.sort((a, b) => sorting === "asc" ? a.value - b.value : b.value - a.value);
        ctx.setEnvironmentKey(variable, { items, count: items.length, type });
        return this.success();
    }
});