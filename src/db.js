const { mkdir, writeFile, readFile, rm, access, cp, readdir } = require("fs/promises");
const { Logger } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");
const { join } = require("path");
const { open } = require("lmdb");

let resolveDefault;
try {
    ({ resolveDefault } = require("@quoriel/edge"));
} catch {
    resolveDefault = (value) => value;
}

let emitter = null;
const databases = new Map();
const types = new Map();
const config = {
    path: join(process.cwd(), "database"),
    separator: "~",
    flags: {},
    events: {
        recordUpdate: false,
        recordRemove: false,
        holdExpire: false
    }
};

const locked = ["path", "name", "dupSort", "useVersions", "maxDbs", "readOnly", "noSubdir"];
const entities = ["user", "member", "guild", "channel", "role", "message"];

function filterFlags(source) {
    const clean = {};
    for (const key in source) {
        if (!locked.includes(key)) clean[key] = source[key];
    }
    return clean;
}

function isValidSchema(schema) {
    if (typeof schema !== "object" || schema === null) return false;
    if (schema.type !== null && !entities.includes(schema.type)) return false;
    if (typeof schema.guild !== "boolean") return false;
    return true;
}

async function initDB(path) {
    if (path) config.path = join(process.cwd(), path);
    await reloadDB();
}

function setupEvents(secret, events) {
    emitter = secret;
    for (const name of events) config.events[name] = true;
    emitter.emit("databaseConnect");
}

async function reloadDB() {
    await mkdir(config.path, { recursive: true });
    const content = await readFile(join(__dirname, "config.json"), "utf8");
    const full = join(config.path, "config.json");
    try {
        await writeFile(full, content, { flag: "wx", encoding: "utf8" });
    } catch (error) {
        if (error.code !== "EEXIST") return;
    }
    try {
        const data = JSON.parse(await readFile(full, "utf8"));
        if (data.separator) {
            config.separator = data.separator;
        }
        if (data.flags) {
            for (const key in config.flags) delete config.flags[key];
            Object.assign(config.flags, filterFlags(data.flags));
        }
        if (data.types) {
            types.clear();
            for (const key in data.types) {
                if (isValidSchema(data.types[key])) types.set(key, data.types[key]);
            }
        }
    } catch (error) {
        Logger.error(error);
    }
}

async function closeDB(array) {
    for (const type of array) {
        await databases.get(type).close();
        databases.delete(type);
    }
}

async function wipeDB(array) {
    await closeDB(array);
    for (const type of array) {
        await rm(join(config.path, "types", type), { recursive: true, force: true });
    }
}

function scheduleHoldExpire(db, type, key, name, exp) {
    setTimeout(() => {
        if (db.get(key)?.holds?.[name] === exp) emitter.emit("holdExpire", { type, key, name, value: exp });
    }, exp - Date.now());
}

function openDatabase(type, flags = {}) {
    const db = open({
        ...config.flags,
        ...flags,
        useVersions: false,
        dupSort: false,
        path: join(config.path, "types", type)
    });
    databases.set(type, db);
    if (config.events.holdExpire) {
        for (const item of db.getRange({ snapshot: false })) {
            const fl = item.value.holds;
            if (!fl) continue;
            for (const name in fl) {
                scheduleHoldExpire(db, type, item.key, name, fl[name]);
            }
        }
    }
    return db;
}

function openDB(array) {
    for (const type of array) {
        if (types.has(type) && !databases.has(type)) {
            openDatabase(type);
        }
    }
}

function registerDB(name, schema, flags = {}) {
    if (!types.has(name)) {
        if (!isValidSchema(schema)) return false;
        types.set(name, schema);
    }
    let db = databases.get(name);
    if (!db) {
        db = openDatabase(name, filterFlags(flags));
    }
    return db;
}

function pingDB(type) {
    const start = performance.now();
    databases.get(type).get("ping");
    return Math.round(performance.now() - start);
}

function activeDB() {
    return [...databases.keys()];
}

async function prefetchDB(type, keys) {
    await databases.get(type).prefetch(keys);
}

function rangeDB(type) {
    const result = [];
    for (const item of databases.get(type).getRange({ snapshot: false })) result.push(item);
    return result;
}

function keysDB(type) {
    const result = [];
    for (const key of databases.get(type).getKeys({ snapshot: false })) result.push(key);
    return result;
}

function searchDB(type, name, valueType, value, entity, guild) {
    const nof = !name && !valueType && !value;
    const sep = config.separator;
    const res = [];
    if (type) {
        processSearch(type, databases.get(type), nof, res, sep, name, valueType, value, entity, guild);
    } else {
        for (const ent of databases) {
            processSearch(ent[0], ent[1], nof, res, sep, name, valueType, value, entity, guild);
        }
    }
    return res;
}

function processSearch(type, db, nof, res, sep, name, valueType, value, entity, guild) {
    const is = types.get(type).guild;
    if (guild && !is) return;
    for (const item of db.getRange({ snapshot: false })) {
        const key = item.key;
        const val = item.value;
        if (is) {
            const pos = key.indexOf(sep);
            if (entity && key.substring(0, pos) !== entity) continue;
            if (guild && key.substring(pos + 1) !== guild) continue;
        } else {
            if (entity && key !== entity) continue;
        }
        if (nof) {
            res.push({ type, key, value: val });
            continue;
        }
        let fil = {};
        let hit = false;
        if (name) {
            if (!(name in val)) continue;
            const pv = val[name];
            if (valueType && typeDefinition(pv) !== valueType) continue;
            if (value && pv !== value) continue;
            fil[name] = pv;
            hit = true;
        } else {
            for (const prop in val) {
                const pv = val[prop];
                if (valueType && typeDefinition(pv) !== valueType) continue;
                if (value && pv !== value) continue;
                fil[prop] = pv;
                hit = true;
            }
        }
        if (!hit) continue;
        res.push({ type, key, value: fil });
    }
}

function typeDefinition(value) {
    if (Array.isArray(value)) return "array";
    const t = typeof value;
    if (t !== "string") return t;
    const trimmed = value.trim();
    return trimmed && !isNaN(+trimmed) ? "number" : "string";
}

function makeKey(ctx, type, entity, guild) {
    const view = types.get(type);
    if (!entity) entity = ctx[view.type]?.id;
    if (view.guild) return entity + config.separator + (guild ?? ctx.guild.id);
    return entity;
}

function formatKey(type, entity, guild) {
    if (types.get(type).guild) return entity + config.separator + guild;
    return entity;
}

function autoKey(ctx, type) {
    const view = types.get(type);
    const entity = ctx[view.type]?.id;
    if (view.guild) return entity + config.separator + ctx.guild.id;
    return entity;
}

async function hold(type, key, name, duration) {
    const db = databases.get(type);
    const original = db.get(key);
    const now = Date.now();
    if (original?.holds?.[name] > now) return false;
    const data = { ...original, holds: { ...original?.holds } };
    const exp = now + duration;
    data.holds[name] = exp;
    await writeRecord(db, type, key, data);
    if (config.events.holdExpire) scheduleHoldExpire(db, type, key, name, exp);
    return true;
}

function valueRecord(type, key, name) {
    const value = databases.get(type).get(key)?.[name];
    const copy = value !== null && typeof value === "object" ? (Array.isArray(value) ? [...value] : { ...value }) : value;
    return resolveDefault(copy, type, name);
}

function existsRecord(type, key) {
    return databases.get(type).doesExist(key);
}

function readRecord(db, type, key) {
    return { ...db.get(key) };
}

function getRecord(type, key) {
    return readRecord(databases.get(type), type, key);
}

async function deleteRecord(db, type, key) {
    if (!config.events.recordRemove) return db.remove(key);
    const value = db.get(key);
    if (value !== undefined) {
        await db.remove(key);
        emitter.emit("recordRemove", { type, key, value: { ...value } });
    }
}

async function removeRecord(type, key) {
    await deleteRecord(databases.get(type), type, key);
}

async function writeRecord(db, type, key, data) {
    const stored = { ...data };
    if (!config.events.recordUpdate) return db.put(key, stored);
    const old = db.get(key);
    await db.put(key, stored);
    emitter.emit("recordUpdate", {
        type,
        key,
        value: {
            old: old !== undefined ? { ...old } : undefined,
            new: stored
        }
    });
}

async function putRecord(type, key, data) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) return false;
    const db = databases.get(type);
    if (Object.keys(data).length) {
        await writeRecord(db, type, key, data);
    } else {
        await deleteRecord(db, type, key);
    }
    return true;
}

async function moveRecord(type, fromKey, toKey, deleteSource) {
    const db = databases.get(type);
    const original = db.get(fromKey);
    if (original === undefined) return false;
    await writeRecord(db, type, toKey, original);
    if (deleteSource !== false) await deleteRecord(db, type, fromKey);
    return true;
}

function leaderBoard(type, name, sorting, guild) {
    const is = types.get(type).guild;
    const items = [];
    for (const item of databases.get(type).getRange({ snapshot: false })) {
        const key = item.key;
        const parts = key.indexOf(config.separator);
        if (!is || key.substring(parts + 1) === guild) {
            const value = Number(item.value[name]);
            if (!isNaN(value)) {
                items.push({ key: is ? key.substring(0, parts) : key, value });
            }
        }
    }
    items.sort((a, b) => (sorting === "asc" ? a.value - b.value : b.value - a.value));
    for (let i = 0, l = items.length; i < l; i++) items[i].position = i + 1;
    return { type, items, count: items.length };
}

async function createBackup(type) {
    const full = join(config.path, "backups", type);
    await rm(full, { recursive: true, force: true });
    await mkdir(full, { recursive: true });
    await databases.get(type).backup(full);
}

async function removeBackup(type) {
    await rm(join(config.path, "backups", type), { recursive: true, force: true });
}

async function restoreBackup(type) {
    if (!types.has(type) || databases.has(type)) return false;
    const db = join(config.path, "types", type);
    try {
        await access(db);
        return false;
    } catch {
        // it just works ¯\_(ツ)_/¯
    }
    const backup = join(config.path, "backups", type);
    try {
        await access(backup);
    } catch {
        return false;
    }
    await cp(backup, db, { recursive: true });
    return true;
}

async function transferDatabase(client, rewrite = false) {
    Logger.info("[QuorielDB] The transfer code will run as soon as ForgeDB is initialized!");
    let items;
    while (true) {
        try {
            items = await client.db.getAll();
            break;
        } catch {
            Logger.info("[QuorielDB] Waiting for ForgeDB to be ready, retrying in 5 seconds...");
            await wait(5000);
        }
    }
    Logger.info("[QuorielDB] The data transfer code has been started.");
    for (const item of items) {
        if (item.type !== "old") {
            const type = item.type.replace("custom", "global");
            if (!databases.has(type)) {
                openDB([type]);
                await wait(2000);
            }
            let key;
            if (type === "global") {
                key = "custom";
            } else if (type === "user" || type === "guild") {
                key = item.id;
            } else {
                key = formatKey(type, item.id, item.guildId);
            }
            let value;
            try {
                value = JSON.parse(item.value);
            } catch {
                value = item.value;
            }
            const db = databases.get(type);
            const original = db.get(key);
            const data = { ...original };
            if (rewrite || !data.hasOwnProperty(item.name)) {
                data[item.name] = value;
                await db.put(key, data);
            }
        }
    }
    Logger.info("[QuorielDB] Data transfer completed!");
}

async function migrationDatabases(options) {
    Logger.info("[QuorielDB] Migration started - tools aligned, buffers cleared, engines humming.");
    const migrationPath = join(config.path, "migration");
    const typesMigrate = await readdir(join(config.path, "types"));
    const oldFlags = options || {
        noReadAhead: true,
        noMemInit: true,
        cache: true
    };
    await cp(join(config.path, "types"), migrationPath, { recursive: true });
    for (const type of typesMigrate) {
        await rm(join(config.path, "types", type), { recursive: true, force: true });
        const oldDB = open({
            ...oldFlags,
            path: join(migrationPath, type)
        });
        const newDB = open({
            ...config.flags,
            useVersions: false,
            dupSort: false,
            path: join(config.path, "types", type)
        });
        for (const item of oldDB.getRange({ snapshot: false })) {
            await newDB.put(item.key, item.value);
        }
        await oldDB.close();
        await newDB.close();
    }
    await rm(migrationPath, { recursive: true, force: true });
    Logger.info(`[QuorielDB] Migration complete! Types updated (${typesMigrate.join(", ")})`);
}

async function wait(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
    initDB,
    setupEvents,

    types,
    config,

    hold,
    makeKey,
    formatKey,
    autoKey,

    migrationDatabases,
    transferDatabase,
    leaderBoard,

    activeDB,
    closeDB,
    keysDB,
    openDB,
    pingDB,
    wipeDB,
    rangeDB,
    reloadDB,
    searchDB,
    registerDB,
    prefetchDB,

    getRecord,
    readRecord,
    valueRecord,
    existsRecord,
    deleteRecord,
    removeRecord,
    writeRecord,
    moveRecord,
    putRecord,

    createBackup,
    removeBackup,
    restoreBackup
};