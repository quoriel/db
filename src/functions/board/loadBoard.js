const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

const SortType = {
    asc: "asc",
    desc: "desc"
};

exports.default = new NativeFunction({
    name: "$loadBoard",
    version: "1.0.0",
    description: "Loads the entire sorted ranked list into the environment variable",
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
            enum: SortType,
            rest: false
        },
        {
            name: "guild",
            description: "Guild identifier",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [variable, type, name, sorting, guild]) {
        const db = dbs.get(type);
        if (!db) {
            return this.success();
        }
        const is = config.types[type].guild;
        guild = guild?.id || ctx.guild.id;
        const items = [];
        let count = -1;
        try {
            for await (const { key, value } of db.getRange()) {
                const [entityID, guildID] = key.split(config.separator);
                if (is && guildID !== guild) {
                    continue;
                }
                const numeric = value[name];
                if (!isNaN(numeric)) {
                    items.push({ key: entityID, value: numeric });
                    count++;
                }
            }
            items.sort((a, b) => sorting === "asc" ? a.value - b.value : b.value - a.value);
            ctx.setEnvironmentKey(variable, { items, count, type });
            return this.success();
        } catch {
            return this.success();
        }
    }
});