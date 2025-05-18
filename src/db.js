const { existsSync } = require("fs");
const { mkdir, writeFile, readFile } = require("fs").promises;
const { resolve, join } = require("path");

const path = resolve(process.cwd(), "quoriel", "db");
const cache = new Map();
const dbs = new Map();

let variables = {};
let config = {};

async function board(db, type, name, sorting, guild) {
    const is = config.types[type].guild;
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
        return { items, count };
    } catch {
        return { items: [], count: 0 };
    }
}

async function update() {
    try {
        await mkdir(path, { recursive: true });
        await rewrite("variables.json", variables, "{}");
        const data = await readFile(resolve(__dirname, "config.json"), "utf8");
        await rewrite("config.json", config, data);
        return true;
    } catch {
        return false;
    }
}

async function rewrite(name, target, content) {
    const full = join(path, name);
    if (!existsSync(full)) {
        await writeFile(full, content, "utf8");
    }
    const data = await readFile(full, "utf8");
    for (const key of Object.keys(target)) {
        delete target[key];
    }
    const parsed = JSON.parse(data);
    Object.assign(target, parsed);
}

module.exports = {
    update,
    board,
    cache,
    dbs,
    variables,
    config,
    path
};