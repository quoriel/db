const { join, resolve } = require("path");
const { existsSync } = require('fs');
const { mkdir, writeFile, readFile, rm } = require("fs").promises;
const { performance } = require('perf_hooks');
const { types } = require("./config");
const path = resolve(process.cwd(), "quoriel/db");
const dbs = new Map();
let variables = {};

function open(type) {
    if (dbs.has(type)) return true;
    const { open } = require("lmdb");
    try {
        const db = open({
            path: join(path, type),
            overlappingSync: true,
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
    if (!dbs.has(type)) return true;
    try {
        await dbs.get(type).close();
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
    try {
        await close(type);
        if (existsSync(full)) {
            await rm(full, { recursive: true, force: true });
        }
        return true;
    } catch {
        return false;
    }
}

async function get(type, name, id) {
    if (!dbs.has(type)) return variables[name];
    try {
        const value = await (await dbs.get(type)).get(id || name);
        return (types[type].json ? JSON.parse(value || "{}")?.[name] : value) || variables[name];
    } catch {
        return variables[name];
    }
}

async function put(type, name, value, id) {
    if (!dbs.has(type)) return false;
    try {
        const db = await dbs.get(type);
        await db.transaction(async () => {
            const key = id || name;
            if (!types[type].json) return await (value == null ? db.remove(key) : db.put(key, value));
            const data = JSON.parse((await db.get(key)) || "{}");
            value == null ? delete data[name] : (data[name] = value);
            await (Object.keys(data).length ? db.put(key, JSON.stringify(data)) : db.remove(key));
        });
        return true;
    } catch {
        return false;
    }
}

async function del(type, name, id) {
    if (!dbs.has(type)) return false;
    try {
        const db = await dbs.get(type);
        await db.transaction(async () => {
            const key = id || name;
            if (!types[type].json) return await db.remove(key);
            const data = JSON.parse((await db.get(key)) || "{}");
            delete data[name];
            await (Object.keys(data).length ? db.put(key, JSON.stringify(data)) : db.remove(key));
        });
        return true;
    } catch {
        return false;
    }
}

async function toggle(type, name, id) {
    if (!dbs.has(type)) return false;
    const current = await get(type, name, id);
    const value = current === "true" ? "false" : "true";
    await put(type, name, value, id);
    return value;
}

async function ping(type) {
    if (!dbs.has(type)) return -1;
    const start = performance.now();
    try {
        await (await dbs.get(type)).get(start);
        return (performance.now() - start + 0.5) | 0;
    } catch (error) {
        return error.name === 'NotFoundError' ? (performance.now() - start + 0.5) | 0 : -1;
    }
}

function active() {
    return Array.from(dbs.keys());
}

module.exports = {
    open,
    close,
    update,
    wipe,
    get,
    put,
    del,
    toggle,
    ping,
    active
};
