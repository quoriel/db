const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { enums, types, separator } = require("../../config");
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
            enum: enums.type,
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
            name: "entity",
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
    async execute(ctx, [type, name, entity, guild]) {
        if (!types[type].json) return this.success(await get(type, name));
        const tupe = types[type].type;
        if (tupe === null) return this.stop();
        let id = entity || ctx[tupe]?.id;
        if (types[tupe].guild) id = `${id}${separator}${guild?.id || ctx.guild.id}`;
        return this.success(await get(type, name, id));
    }
});