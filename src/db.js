const { join, resolve } = require("path");
const { existsSync } = require("fs");
const { mkdir, writeFile, readFile, rm } = require("fs").promises;
const { performance } = require("perf_hooks");
const { types, separator } = require("./config");
const { open: create } = require("lmdb");
const path = resolve(process.cwd(), "quoriel/db");
const cache = new Map();
const dbs = new Map();
let variables = {};

function open(type) {
    if (dbs.has(type)) return true;
    try {
        const db = create({
            path: join(path, type),
            noReadAhead: true,
            noMemInit: true,
            compression: true,
            cache: true
        });
        dbs.set(type, db);
        return true;
    } catch {
        return false;
    }
}

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
    try {
        await mkdir(path, { recursive: true });
        if (!existsSync(full)) {
            await writeFile(full, "{}");
        }
        variables = JSON.parse(await readFile(full, "utf8"));
        return true;
    } catch {
        return false;
    }
}

async function wipe(type) {
    const full = join(path, type);
    await close(type);
    try {
        if (existsSync(full)) {
            await rm(full, { recursive: true, force: true });
        }
        return true;
    } catch {
        return false;
    }
}

async function inspect(type) {
    const db = dbs.get(type);
    if (!db) return "[]";
    const is = types[type].json;
    try {
        const entries = await db.getRange();
        return JSON.stringify(Array.from(entries, ({ key, value }) => ({
            key, value: is ? JSON.parse(value) : value
        })));
    } catch {
        return "[]";
    }
}

async function get(type, name, entity) {
    const db = await dbs.get(type);
    if (!db) return variables[name];
    try {
        const value = await db.get(entity || name);
        return (types[type].json ? JSON.parse(value || "{}")?.[name] : value) || variables[name];
    } catch {
        return variables[name];
    }
}

async function put(type, name, value, entity) {
    const db = await dbs.get(type);
    if (!db) return false;
    const key = entity || name;
    try {
        if (!types[type].json) return value ? await db.put(key, value) : await db.remove(key);
        const current = await db.get(key);
        const data = current ? JSON.parse(current) : {};
        value ? data[name] = value : delete data[name];
        Object.keys(data).length ? await db.put(key, JSON.stringify(data)) : await db.remove(key);
        return true;
    } catch {
        return false;
    }
}

async function del(type, name, entity) {
    const db = await dbs.get(type);
    if (!db) return false;
    const key = entity || name;
    try {
        if (!types[type].json) return await db.remove(key);
        const current = await db.get(key);
        if (!current) return true;
        const data = JSON.parse(current);
        delete data[name];
        Object.keys(data).length ? await db.put(key, JSON.stringify(data)) : await db.remove(key);
        return true;
    } catch {
        return false;
    }
}

async function toggle(type, name, entity) {
    if (!dbs.has(type)) return false;
    const current = await get(type, name, entity);
    const value = current === "true" ? "false" : "true";
    await put(type, name, value, entity);
    return value;
}

async function ping(type) {
    const db = await dbs.get(type);
    if (!db) return -1;
    const start = performance.now();
    try {
        await db.get("ping");
        return (performance.now() - start + 0.5) | 0;
    } catch (error) {
        return error.name === 'NotFoundError' ? (performance.now() - start + 0.5) | 0 : -1;
    }
}

async function entry(type, name, sorting, guild) {
    const db = dbs.get(type);
    if (!db) return;
    let entries;
    try {
        entries = await db.getRange();
    } catch {
        return;
    }
    const is = types[type].guild;
    const ranked = [];
    let length = 0;
    for (const { key, value } of entries) {
        const [entityId, guildId] = key.split(separator);
        if (is && guildId !== guild) continue;
        let parsed;
        try {
            parsed = JSON.parse(value)[name];
        } catch {
            continue;
        }
        if (!isNaN(parsed)) {
            ranked.push({ entity: entityId, value: parsed });
            length++;
        }
    }
    ranked.sort((a, b) => sorting === "asc" ? a.value - b.value : b.value - a.value);
    return { ranked, length };
}

function active() {
    return Array.from(dbs.keys());
}

module.exports = {
    open,
    close,
    update,
    wipe,
    inspect,
    get,
    put,
    del,
    toggle,
    ping,
    entry,
    active,
    cache
};
