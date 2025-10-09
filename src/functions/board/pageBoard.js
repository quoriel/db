const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$pageBoard",
    description: "Loads a paginated leaderboard slice into the environment variable",
    version: "1.5.0",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "variable",
            description: "Source environment variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "new",
            description: "Target environment variable name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "page",
            description: "Page number",
            type: ArgType.Number,
            required: true,
            rest: false
        },
        {
            name: "max",
            description: "Number of leaders per page",
            type: ArgType.Number,
            required: true,
            rest: false
        }
    ],
    execute(ctx, [variable, newe, page, max]) {
        const json = ctx.getEnvironmentKey(variable);
        const start = (page - 1) * max;
        const items = json.items.slice(start, start + max);
        ctx.setEnvironmentKey(newe, { items, count: items.length, type: json.type });
        return this.success();
    }
});