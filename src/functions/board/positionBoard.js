const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$positionBoard",
    description: "Returns the position of the specified entity in the ranked list",
    version: "1.5.0",
    output: ArgType.Number,
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
            if (json.type === null) return this.success(0);
            entity = ctx[json.type]?.id;
        }
        let index = -1;
        for (let i = 0; i < json.count; i++) {
            if (json.items[i].key === entity) {
                index = i;
                break;
            }
        }
        return this.success(index + 1);
    }
});