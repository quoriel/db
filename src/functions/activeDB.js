const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { active } = require("../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    version: "1.0.0",
    description: "Отображает все активные базы данных, которые в данный момент открыты",
    output: ArgType.Unknown,
    brackets: false,
    unwrap: true,
    args: [
        {
            name: "separator",
            description: "Для разделения открытих баз",
            type: ArgType.String,
            rest: false
        }
    ],
    execute(ctx, [separator]) {
        return this.success(active().join(separator || ", "));
    }
});
