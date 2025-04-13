const { join } = require("path");
const { existsSync } = require("fs");
const { mkdir, writeFile, readFile } = require("fs").promises;
const { types, separator, path } = require("./config");
const cache = new Map();
const dbs = new Map();
let variables = {};

async function close(type) {
    const db = dbs.get(type);
    if (!db) return true;
    try {
        await db.close();
        dbs.delete(type);
        return true;
    } catch {
        return false;
    }
}

async function update() {
    const full = join(path, "variables.json");
    const exists = existsSync(full);
    try {
        await mkdir(path, { recursive: true });
        const text = exists ? await readFile(full, "utf8") : "{}";
        if (!exists) await writeFile(full, text);
        Object.keys(variables).forEach(key => delete variables[key]);
        Object.assign(variables, JSON.parse(text));
        return true;
    } catch {
        return false;
    }
}

async function entry(type, name, sorting, guild) {
    const db = dbs.get(type);
    if (!db) return { ranked: [], length: 0 };
    const is = types[type].guild;
    const ranked = [];
    let length = 0;
    try {
        for await (const { key, value } of db.getRange()) {
            const [entityId, guildId] = key.split(separator);
            if (is && guildId !== guild) continue;
            const parsed = JSON.parse(value)[name];
            if (!isNaN(parsed)) {
                ranked.push({ entity: entityId, value: parsed });
                length++;
            }
        }
        ranked.sort((a, b) => sorting === "asc" ? a.value - b.value : b.value - a.value);
        return { ranked, length };
    } catch {
        return { ranked: [], length: 0 };
    }
}

function active() {
    return Array.from(dbs.keys());
}

module.exports = {
    close,
    update,
    entry,
    active,
    cache,
    dbs,
    variables
};
