const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { dbs, config } = require("../../db");

exports.default = new NativeFunction({
    name: "$loadBoard",
    version: "1.0.0",
    description: "Возвращает весь отсортированный ранжированный список",
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "variable",
            description: "Переменная, в которую нужно загрузить",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "type",
            description: "Тип данных",
            type: ArgType.String,
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
            name: "sorting",
            description: "Тип сортировки",
            type: ArgType.Enum,
            enum: {
                asc: "asc",
                desc: "desc"
            },
            rest: false
        },
        {
            name: "guild",
            description: "Идентификатор гильдии",
            type: ArgType.Guild,
            rest: false
        }
    ],
    async execute(ctx, [variable, type, name, sorting, guild]) {
        const db = dbs.get(type);
        if (!config?.types?.[type] || !db) {
            return this.success();
        }
        const is = config.types[type].guild;
        guild = guild?.id || ctx.guild.id;
        const items = [];
        let count = 0;
        try {
            for await (const { key, value } of db.getRange()) {
                const [entity, guildId] = key.split(config.separator);
                if (is && guildId !== guild) {
                    continue;
                }
                const num = value[name];
                if (!isNaN(num)) {
                    items.push({ key: entity, value: num });
                    count++;
                }
            }
            items.sort((a, b) => sorting === "asc" ? a.value - b.value : b.value - a.value);
            ctx.setEnvironmentKey(variable, { items, count, type });
            return this.success();
        } catch {
            return this.success();
        }
    }
});