const { join, resolve } = require("path");
const { existsSync } = require("fs");
const { mkdir, writeFile, readFile, rm } = require("fs").promises;
const { performance } = require("perf_hooks");
const { types } = require("./config");
const path = resolve(process.cwd(), "quoriel/db");
const cache = new Map();
const dbs = new Map();
let variables = {};

function open(type) {
    if (dbs.has(type)) return true;
    const { open } = require("lmdb");
    try {
        const db = open({
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
    const parse = types[type].json;
    try {
        return JSON.stringify(Array.from(await db.getRange(), ({ key, value }) => ({
            key, value: parse ? JSON.parse(value) : value
        })));
    } catch {
        return "[]";
    }
}

async function get(type, name, id) {
    const db = await dbs.get(type);
    if (!db) return variables[name];
    try {
        const value = await db.get(id || name);
        return (types[type].json ? JSON.parse(value || "{}")?.[name] : value) || variables[name];
    } catch {
        return variables[name];
    }
}

async function put(type, name, value, id) {
    const db = await dbs.get(type);
    if (!db) return false;
    const key = id || name;
    try {
        await db.transaction(async tx => {
            if (!types[type].json) return value ? await tx.put(key, value) : await tx.remove(key);
            const current = await tx.get(key);
            const data = current ? JSON.parse(current) : {};
            value ? data[name] = value : delete data[name];
            Object.keys(data).length ? await tx.put(key, JSON.stringify(data)) : await tx.remove(key);
        });
        return true;
    } catch {
        return false;
    }
}

async function del(type, name, id) {
    const db = await dbs.get(type);
    if (!db) return false;
    const key = id || name;
    try {
        await db.transaction(async tx => {
            if (!types[type].json) return await tx.remove(key);
            const current = await tx.get(key);
            if (!current) return true;
            const data = current ? JSON.parse(current) : {};
            delete data[name];
            Object.keys(data).length ? await tx.put(key, JSON.stringify(data)) : await tx.remove(key);
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
    active,
    cache
};