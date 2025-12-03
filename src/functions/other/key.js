const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { makeKey } = require("../../db");

exports.default = new NativeFunction({
    name: "$key",
    description: "Builds a composite key",
    version: "2.0.0",
    output: ArgType.String,
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
        return this.success(makeKey(ctx, type, entity, guild?.id));
    }
});