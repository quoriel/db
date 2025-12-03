const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, hold } = require("../../db");

exports.default = new NativeFunction({
    name: "$hold",
    description: "Applies a hold timer to prevent repeated actions",
    version: "2.0.0",
    brackets: true,
    unwrap: false,
    args: [
        {
            name: "type",
            description: "Data type",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Hold name",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "duration",
            description: "Hold duration",
            type: ArgType.Time,
            required: true,
            rest: false
        },
        {
            name: "code",
            description: "Code to execute",
            type: ArgType.String,
            rest: false
        },
        {
            name: "key",
            description: "Record key",
            type: ArgType.String,
            rest: false
        }
    ],
    async execute(ctx) {
        const type = await this["resolveUnhandledArg"](ctx, 0);
        if (!this["isValidReturnType"](type)) return type;
        const name = await this["resolveUnhandledArg"](ctx, 1);
        if (!this["isValidReturnType"](name)) return name;
        const duration = await this["resolveUnhandledArg"](ctx, 2);
        if (!this["isValidReturnType"](duration)) return duration;
        const key = await this["resolveUnhandledArg"](ctx, 4);
        if (!this["isValidReturnType"](key)) return key;
        if (!(await hold(type.value, key.value || autoKey(ctx, type.value), name.value, duration.value))) {
            const field = this.data.fields[3];
            if (field) {
                const code = await this["resolveCode"](ctx, field);
                if (!this["isValidReturnType"](code)) return code;
                ctx.container.content = code.value;
                await ctx.container.send(ctx.obj);
            }
            return this.stop();
        }
        return this.success();
    }
});