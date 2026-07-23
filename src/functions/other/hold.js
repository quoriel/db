const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { autoKey, hold } = require("../../db");

exports.default = new NativeFunction({
    name: "$hold",
    description: "Applies a hold timer to prevent repeated actions",
    version: "3.0.0",
    brackets: true,
    unwrap: false,
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
        const variable = await this.resolveUnhandledArg(ctx, 0);
        if (!this.isValidReturnType(variable)) return variable;
        const type = await this.resolveUnhandledArg(ctx, 1);
        if (!this.isValidReturnType(type)) return type;
        const name = await this.resolveUnhandledArg(ctx, 2);
        if (!this.isValidReturnType(name)) return name;
        const duration = await this.resolveUnhandledArg(ctx, 3);
        if (!this.isValidReturnType(duration)) return duration;
        const key = await this.resolveUnhandledArg(ctx, 5);
        if (!this.isValidReturnType(key)) return key;
        const data = await hold(type.value, key.value || autoKey(ctx, type.value), ctx.getEnvironmentKey(variable.value), name.value, duration.value);
        if (!data) {
            const field = this.data.fields[4];
            if (field) {
                const code = await this.resolveCode(ctx, field);
                if (!this.isValidReturnType(code)) return code;
                ctx.container.content = code.value;
                await ctx.container.send(ctx.obj);
            }
            return this.stop();
        }
        ctx.setEnvironmentKey(variable.value, data);
        return this.success();
    }
});