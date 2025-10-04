const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$nearbyBoard",
    description: "Shows the count of competitors before and after the entity in the leaderboard",
    version: "1.1.0",
    output: ArgType.Json,
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
            name: "entity",
            description: "Entity identifier",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx, [variable, entity]) {
        const json = ctx.getEnvironmentKey(variable);
        if (!json?.items) return this.successJSON([0, 0]);
        if (!entity) {
            if (json.type === null) return this.successJSON([0, 0]);
            entity = ctx[json.type]?.id;
        }
        const index = json.items.findIndex(item => item.key === entity);
        if (index === -1) return this.successJSON([0, 0]);
        const after = json.items.length - index - 1;
        return this.successJSON([index, after]);
    }
});