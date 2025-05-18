const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$activeDB",
    version: "1.0.0",
    description: "Получение списка активных баз данных",
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
        const active = Array.from(dbs.keys());
        return this.success(active.join(separator || ', '));
    }
});