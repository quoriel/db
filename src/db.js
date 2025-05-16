const { existsSync } = require("fs");
const { mkdir, writeFile, readFile } = require("fs").promises;
const { resolve, join } = require("path");

const path = resolve(process.cwd(), "quoriel", "db");
const cache = new Map();
const dbs = new Map();

let variables = {};
let config = {};

async function get(db, type, name, entity) {
    try {
        const value = await db.get(entity || name);
        return (config.types[type].json ? getJson(JSON.parse(value || "{}"), name) : value) || getJson(variables, name);
    } catch {
        return getJson(variables, name);
    }
}

async function put(db, type, name, value, entity) {
    const key = entity || name;
    try {
        if (!config.types[type].json) return value ? await db.put(key, value) : await db.remove(key);
        const current = await db.get(key);
        const data = current ? JSON.parse(current) : {};
        value ? putJson(data, name, value) : delJson(data, name);
        Object.keys(data).length ? await db.put(key, JSON.stringify(data)) : await db.remove(key);
        return true;
    } catch {
        return false;
    }
}

async function del(db, type, name, entity) {
    const key = entity || name;
    try {
        if (!config.types[type].json) return await db.remove(key);
        const current = await db.get(key);
        if (!current) return true;
        const data = JSON.parse(current);
        delJson(data, name);
        Object.keys(data).length ? await db.put(key, JSON.stringify(data)) : await db.remove(key);
        return true;
    } catch {
        return false;
    }
}

async function toggle(db, type, name, entity) {
    const key = entity || name;
    try {
        let current = await db.get(key);
        if (!config.types[type].json) {
            current ||= getJson(variables, name);
            const value = current === "true" ? "false" : "true";
            await db.put(key, value);
            return value;
        }
        const data = JSON.parse(current || "{}");
        const old = getJson(data, name) || getJson(variables, name);
        const value = old === "true" ? "false" : "true";
        putJson(data, name, value);
        await db.put(key, JSON.stringify(data));
        return value;
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

async function board(type, name, sorting, guild) {
    const db = dbs.get(type);
    if (!db) return { items: [], count: 0 };
    const is = config.types[type].guild;
    let result = "[";
    let first = true;
    let count = 0;
    try {
        for await (const { key, value } of db.getRange()) {
            const [entityId, guildId] = key.split(config.separator);
            if (is && guildId !== guild) continue;
            const parsed = getJson(JSON.parse(value), name);
            if (!isNaN(parsed)) {
                first ? first = false : result += ",";
                result += `{"entity":"${entityId}","value":"${parsed}"}`;
                count++;
            }
        }
        const items = JSON.parse(result + "]");
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

function delJson(object, name) {
    const keys = name.split(".");
    const last = keys.pop();
    let current = object;
    for (const key of keys) {
        if (typeof current[key] !== "object" || !current[key]) return;
        current = current[key];
    }
    delete current[last];
}

function putJson(object, name, value) {
    const keys = name.split(".");
    const last = keys.pop();
    let current = object;
    for (const key of keys) {
        if (typeof current[key] !== "object" || !current[key]) {
            current[key] = {};
        }
        current = current[key];
    }
    current[last] = value;
}

function getJson(object, name) {
    const result = name.split(".").reduce((acc, key) => acc?.[key], object);
    return typeof result === "object" ? JSON.stringify(result) : result;
}

function active() {
    return Array.from(dbs.keys());
}

module.exports = {
    close,
    get,
    put,
    del,
    toggle,
    update,
    board,
    active,
    getJson,
    cache,
    dbs,
    variables,
    config,
    path
};