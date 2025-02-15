const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types } = require("../../config");
const { get } = require("../../db");

exports.default = new NativeFunction({
    name: "$getVar",
    version: "1.0.0",
    description: "Получает значение переменной, связанной с сущностью",
    output: ArgType.Unknown,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Тип переменной",
            type: ArgType.Enum,
            enum: enums,
            required: true,
            rest: false
        },
        {
            name: "name",
            description: "Имя переменной",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "id",
            description: "Идентификатор сущности",
            type: ArgType.String,
            rest: false
        },
        {
            name: "guild",
            description: "Идентификатор гильдии",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [type, name, id, guild]) {
        if (!types[type].json) return this.success(await get(type, name));
        const tupe = types[type].type;
        if (tupe === null && !id) return this.stop();
        let key = id || ctx[tupe]?.id;
        if (types[tupe].guild) key = `${key}-${guild?.id || ctx.guild.id}`;
        return this.success(await get(type, name, key));
    }
});