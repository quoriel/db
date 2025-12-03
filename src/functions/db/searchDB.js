const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { searchDB } = require("../../db");

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
    version: "2.0.0",
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
            name: "valueType",
            description: "Filter by value type",
            type: ArgType.Enum,
            enum: valueType,
            rest: false
        },
        {
            name: "value",
            description: "Filter by actual value",
            type: ArgType.String,
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
    execute(ctx, [type, name, valueType, value, entity, guild]) {
        return this.successJSON(searchDB(type, name, valueType, value, entity, guild ? guild?.id || ctx.guild.id : null));
    }
});