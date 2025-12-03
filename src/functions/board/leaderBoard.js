const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { leaderBoard } = require("../../db");

const sortType = {
    asc: "asc",
    desc: "desc"
};

exports.default = new NativeFunction({
    name: "$leaderBoard",
    description: "Loads the entire sorted ranked list into the environment variable",
    version: "2.0.0",
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
        ctx.setEnvironmentKey(variable, leaderBoard(type, name, sorting, guild?.id || ctx.guild.id));
        return this.success();
    }
});