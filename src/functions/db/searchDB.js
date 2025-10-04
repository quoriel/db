const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, types, config } = require("../../db");

const valueType = {
    string: "string",
    number: "number",
    boolean: "boolean",
    object: "object",
    array: "array"
};

exports.default = new NativeFunction({
    name: "$searchDB",
    description: "Searches the database with various filters",
    version: "1.4.0",
    output: ArgType.Json,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type (if not specified, searches all open databases)",
            type: ArgType.String,
            rest: false
        },
        {
            name: "name",
            description: "Variable name to search for",
            type: ArgType.String,
            rest: false
        },
        {
            name: "value",
            description: "Filter by value type",
            type: ArgType.Enum,
            enum: valueType,
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
    execute(ctx, [type, name, valus, entity, guild]) {
        if (!!type && !dbs.has(type)) return this.successJSON([]);
        const results = [];
        const databases = !!type ? [[type, dbs.get(type)]] : Array.from(dbs.entries());
        for (const [tupe, db] of databases) {
            const isGuild = types.get(tupe).guild;
            if (!!guild && !isGuild) continue;
            for (const { key, value } of db.getRange()) {
                if (isGuild) {
                    const [entityID, guildID] = key.split(config.entitySeparator);
                    if (!!entity && entityID !== entity) continue;
                    if (!!guild && guildID !== (guild?.id || ctx.guild.id)) continue;
                } else {
                    if (!!entity && key !== entity) continue;
                }
                let filtered = value;
                if (!!name || !!valus) {
                    filtered = {};
                    for (const [varName, varValue] of Object.entries(value)) {
                        if (!!name && varName !== name) continue;
                        if (!!valus) {
                            let actual = Array.isArray(varValue) ? "array" : typeof varValue;
                            if (actual === "string") {
                                const trimmed = varValue.trim();
                                if (trimmed && !isNaN(trimmed)) {
                                    actual = "number";
                                }
                            }
                            if (actual !== valus) continue;
                        }
                        filtered[varName] = varValue;
                    }
                    if (Object.keys(filtered).length === 0) continue;
                }
                results.push({
                    type: tupe,
                    key,
                    value: filtered
                });
            }
        }
        return this.successJSON(results);
    }
});