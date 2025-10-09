const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$nearbyBoard",
    description: "Shows the count of competitors before and after the entity in the leaderboard",
    version: "1.5.0",
    output: ArgType.Json,
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
            name: "entity",
            description: "Entity identifier",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [variable, entity]) {
        const json = ctx.getEnvironmentKey(variable);
        if (!entity) {
            if (json.type === null) return this.successJSON([0, 0]);
            entity = ctx[json.type]?.id;
        }
        let index = -1;
        for (let i = 0; i < json.count; i++) {
            if (json.items[i].key === entity) {
                index = i;
                break;
            }
        }
        if (index === -1) return this.successJSON([0, 0]);
        const after = json.count - index - 1;
        return this.successJSON([index, after]);
    }
});