const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$positionBoard",
    description: "Returns the position of the specified entity in the ranked list",
    version: "1.1.0",
    output: ArgType.Number,
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
        if (!json?.items) return this.success(0);
        if (!entity) {
            if (json.type === null) return this.success(0);
            entity = ctx[json.type]?.id;
        }
        const index = json.items.findIndex(item => item.key === entity);
        return this.success(index + 1);
    }
});