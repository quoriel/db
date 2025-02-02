const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { del } = require('../db');
const { enums, types } = require('../config');

exports.default = new NativeFunction({
    name: "$delVar",
    version: "1.0.0",
    description: "Удаляет заданную переменную из указанной сущности",
    output: ArgType.Boolean,
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
        if (!types[type].json) return this.success(await del(type, name));
        const tupe = types[type].type;
        if (tupe === null && !id) return this.stop();
        let key = id || ctx[tupe]?.id;
        if (types[tupe].guild) key = `${key}-${guild?.id || ctx.guild.id}`;
        return this.success(await del(type, name, key));
    }
});