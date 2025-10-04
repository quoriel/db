const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$closeDB",
    description: "Closes the connection to one or more databases",
    version: "1.3.0",
    output: ArgType.Number,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "types",
            description: "Data type(s)",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    async execute(ctx, [array]) {
        let count = 0;
        for (const type of array) {
            const db = dbs.get(type);
            if (!db) {
                count++;
                continue;
            }
            try {
                await db.close();
                dbs.delete(type);
                count++;
            } catch (error) {
                Logger.error(error);
            }
        }
        return this.success(count);
    }
});