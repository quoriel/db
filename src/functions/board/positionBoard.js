const { NativeFunction, ArgType } = require("@tryforge/forgescript");

exports.default = new NativeFunction({
    name: "$positionBoard",
    version: "1.0.0",
    description: "Возвращает позицию указанной сущности в ранжированном списке",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "variable",
            description: "Ключ к возврату его значения",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "entity",
            description: "Идентификатор сущности",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx, [variable, entity]) {
        const json = ctx.getEnvironmentKey(variable);
        if (!json?.items) {
            return this.success(-1);
        }
        if (!entity) {
            if (json.type === null) {
                return this.success(-1);
            }
            entity = ctx[json.type]?.id;
        }
        for (let i = 0; i < json.items.length; i++) {
            if (json.items[i].key === entity) {
                return this.success(i);
            }
        }
        return this.success(-1);
    }
});
