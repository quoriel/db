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
    version: "1.6.0",
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
        if (type && !dbs.has(type)) return this.successJSON([]);
        const results = [];
        const databases = type ? [[type, dbs.get(type)]] : Array.from(dbs.entries());
        const guildID = guild?.id || ctx.guild?.id;
        for (let i = 0; i < databases.length; i++) {
            const tupe = databases[i][0];
            const db = databases[i][1];
            const is = types.get(tupe).guild;
            if (guild && !is) continue;
            for (const item of db.getRange()) {
                const key = item.key;
                const value = item.value;
                if (is) {
                    const parts = key.split(config.entitySeparator);
                    if (entity && parts[0] !== entity) continue;
                    if (guild && parts[1] !== guildID) continue;
                } else {
                    if (entity && key !== entity) continue;
                }
                let filtered = value;
                if (name || valus) {
                    filtered = {};
                    const keys = Object.keys(value);
                    for (let k = 0; k < keys.length; k++) {
                        const vname = keys[k];
                        const vvalue = value[vname];
                        if (name && vname !== name) continue;
                        if (valus) {
                            let actual = Array.isArray(vvalue) ? "array" : typeof vvalue;
                            if (actual === "string") {
                                const trimmed = vvalue.trim();
                                if (trimmed && !isNaN(trimmed)) actual = "number";
                            }
                            if (actual !== valus) continue;
                        }
                        filtered[vname] = vvalue;
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