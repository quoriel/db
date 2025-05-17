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
        if (config.types[type].json) {
            if (value) {
                return getJson(JSON.parse(value), name) || getJson(variables, name);
            } else {
                return getJson(variables, name);
            }
        } else {
            return value || getJson(variables, name);
        }
    } catch {
        return getJson(variables, name);
    }
}

async function put(db, type, name, value, entity) {
    const key = entity || name;
    try {
        if (!config.types[type].json) {
            if (value) {
                return await db.put(key, value);
            } else {
                return await db.remove(key);
            }
        }
        const current = await db.get(key);
        const data = current ? JSON.parse(current) : {};
        if (value) {
            putJson(data, name, value);
        } else {
            delJson(data, name);
        }
        if (Object.keys(data).length) {
            await db.put(key, JSON.stringify(data));
        } else {
            await db.remove(key);
        }
        return true;
    } catch {
        return false;
    }
}

async function del(db, type, name, entity) {
    const key = entity || name;
    try {
        if (!config.types[type].json) {
            return await db.remove(key);
        }
        const current = await db.get(key);
        if (!current) {
            return true;
        }
        const data = JSON.parse(current);
        delJson(data, name);
        if (Object.keys(data).length) {
            await db.put(key, JSON.stringify(data));
        } else {
            await db.remove(key);
        }
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
            if (!current) {
                current = getJson(variables, name);
            }
            const value = current === "true" ? "false" : "true";
            await db.put(key, value);
            return value;
        }
        const data = current ? JSON.parse(current) : {};
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
    if (!db) {
        return { items: [], count: 0 };
    }
    const is = config.types[type].guild;
    const items = [];
    let count = 0;
    try {
        for await (const { key, value } of db.getRange()) {
            const [entityId, guildId] = key.split(config.separator);
            if (is && guildId !== guild) {
                continue;
            }
            const parsed = getJson(JSON.parse(value), name);
            if (!isNaN(parsed)) {
                items.push({ entity: entityId, value: parsed });
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

function delJson(object, name) {
    const keys = name.split(".");
    const last = keys.pop();
    let current = object;
    for (const key of keys) {
        if (typeof current[key] !== "object" || !current[key]) {
            return;
        }
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