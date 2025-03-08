const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { close, active } = require("../../db");

exports.default = new NativeFunction({
    name: "$closeAllDB",
    version: "1.0.0",
    description: "Закрывает все соединения с базами данных",
    output: ArgType.Boolean,
    unwrap: true,
    async execute(ctx) {
        let result = true;
        for (const type of active()) {
            if (!await close(type)) result = false;
        }
        return this.success(result);
    }
});