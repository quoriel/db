const { NativeFunction, ArgType, Logger } = require("@tryforge/forgescript");
const { dbs } = require("../../db");

exports.default = new NativeFunction({
    name: "$prefetchDB",
    version: "1.2.0",
    description: "Prefetches database entries into memory to speed up future access",
    output: ArgType.Boolean,
    brackets: true,
    unwrap: true,
    args: [
        {
            name: "type",
            description: "Data type",
            type: ArgType.String,
            required: true,
            rest: false
        },
        {
            name: "ids",
            description: "Entity IDs to prefetch",
            type: ArgType.String,
            required: true,
            rest: true
        }
    ],
    async execute(ctx, [type, ids]) {
        const db = dbs.get(type);
        if (!db) {
            return this.success(false);
        }
        try {
            await db.prefetch(ids);
            return this.success(true);
        } catch (error) {
            Logger.error(`Failed to prefetch entries for database of type "${type}":\n`, error.message);
            return this.success(false);
        }
    }
});
