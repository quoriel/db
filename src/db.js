const { mkdir, writeFile, readFile, rm, access, cp, readdir } = require("fs").promises;
const { Logger } = require("@tryforge/forgescript");
const { performance } = require("perf_hooks");
const { resolve, join } = require("path");
const { open } = require("lmdb");

const path = resolve(process.cwd(), "quoriel", "db");
const dbs = new Map();
const variables = new Map();
const types = new Map();
const flags = {};

let eventUpdate = false;
let eventRemove = false;
let entitySeparator = "~";
let variableSeparator = "→";
let emitter = null;

async function init(heavens, sails) {
    await reloadDB();
    emitter = heavens;
    eventUpdate = sails?.includes("recordUpdate") || false;
    eventRemove = sails?.includes("recordRemove") || false;
    emitter.emit("databaseConnect");
}

async function reloadDB() {
    await mkdir(path, { recursive: true });
    const content = await readFile(resolve(__dirname, "config.json"), "utf8");
    await loadFile("config.json", content);
    await loadFile("variables.json", "{}");
}

async function loadFile(name, content) {
    const full = join(path, name);
    try {
        await writeFile(full, content, { flag: "wx", encoding: "utf8" });
    } catch (error) {
        if (error.code !== "EEXIST") return;
    }
    try {
        const data = JSON.parse(await readFile(full, "utf8"));
        if (name === "config.json") {
            if (data.separators) {
                entitySeparator = data.separators.entity || "~";
                variableSeparator = data.separators.variable || "→";
            }
            if (data.flags) {
                for (const key in flags) delete flags[key];
                for (const key in data.flags) {
                    if (!["path", "name", "dupSort", "useVersions", "maxDbs", "readOnly", "noSubdir"].includes(key)) {
                        flags[key] = data.flags[key];
                    }
                }
            }
            if (data.types) {
                types.clear();
                for (const key in data.types) types.set(key, data.types[key]);
            }
        } else {
            variables.clear();
            if (Object.keys(data).length) flattenMap(variables, data);
        }
    } catch (error) {
        Logger.error(error);
    }
}

function flattenMap(map, object, prefix = "") {
    const entries = Object.entries(object);
    for (let i = 0, l = entries.length; i < l; i++) {
        const key = entries[i][0];
        const value = entries[i][1];
        const full = prefix ? prefix + variableSeparator + key : key;
        if (Array.isArray(value)) {
            map.set(full, value);
            for (let index = 0, v = value.length; index < v; index++) {
                const item = value[index];
                const ikey = full + variableSeparator + index;
                if (item && typeof item === "object") {
                    map.set(ikey, item);
                    flattenMap(map, item, ikey);
                } else if (item !== "") {
                    map.set(ikey, item);
                }
            }
        } else if (value && typeof value === "object") {
            map.set(full, value);
            flattenMap(map, value, full);
        } else if (value !== "") {
            map.set(full, value);
        }
    }
}

async function closeDB(array) {
    for (const type of array) {
        await dbs.get(type).close();
        dbs.delete(type);
    }
}

async function wipeDB(array) {
    await closeDB(array);
    for (const type of array) {
        await rm(join(path, "types", type), { recursive: true, force: true });
    }
}

function openDB(array) {
    for (const type of array) {
        if (types.has(type) && !dbs.has(type)) {
            const db = open({
                ...flags,
                useVersions: false,
                dupSort: false,
                path: join(path, "types", type)
            });
            dbs.set(type, db);
        }
    }
}

function pingDB(type) {
    const start = performance.now();
    dbs.get(type).get("ping");
    return Math.round(performance.now() - start);
}

function activeDB() {
    return [...dbs.keys()];
}

async function prefetchDB(type, keys) {
    await dbs.get(type).prefetch(keys);
}

function rangeDB(type) {
    const result = [];
    for (const item of dbs.get(type).getRange({ snapshot: false })) result.push(item);
    return result;
}

function keysDB(type) {
    const result = [];
    for (const key of dbs.get(type).getKeys({ snapshot: false })) result.push(key);
    return result;
}

function searchDB(type, name, valueType, value, entity, guild) {
    const entries = type ? [[type, dbs.get(type)]] : [...dbs];
    const result = [];
    for (let i = 0, l = entries.length; i < l; i++) {
        const typeKey = entries[i][0];
        const db = entries[i][1];
        const is = types.get(typeKey).guild;
        if (guild && !is) continue;
        for (let item of db.getRange({ snapshot: false })) {
            const key = item.key;
            const itemValue = item.value;
            if (is) {
                const parts = key.indexOf(entitySeparator);
                if (entity && key.substring(0, parts) !== entity) continue;
                if (guild && key.substring(parts + 1) !== guild) continue;
            } else {
                if (entity && key !== entity) continue;
            }
            let filtered;
            if (!name && !valueType && !value) {
                filtered = itemValue;
            } else {
                filtered = {};
                if (name) {
                    if (!(name in itemValue)) continue;
                    const propValue = itemValue[name];
                    if (valueType && typeDefinition(propValue) !== valueType) continue;
                    if (value && propValue !== value) continue;
                    filtered[name] = propValue;
                } else {
                    const keys = Object.keys(itemValue);
                    for (let k = 0, g = keys.length; k < g; k++) {
                        const obName = keys[k];
                        const obValue = itemValue[obName];
                        if (valueType && typeDefinition(obValue) !== valueType) continue;
                        if (value && obValue !== value) continue;
                        filtered[obName] = obValue;
                    }
                }
                if (!Object.keys(filtered).length) continue;
            }
            result.push({ type: typeKey, key, value: filtered });
        }
    }
    return result;
}

function typeDefinition(value) {
    let type = Array.isArray(value) ? "array" : typeof value;
    if (type === "string") {
        const trimmed = value.trim();
        if (trimmed && !isNaN(+trimmed)) type = "number";
    }
    return type;
}

function makeKey(ctx, type, entity, guild) {
    const view = types.get(type);
    if (!entity) entity = ctx[view.type]?.id;
    if (view.guild) return entity + entitySeparator + (guild ?? ctx.guild.id);
    return entity;
}

function formatKey(type, entity, guild) {
    if (types.get(type).guild) return entity + entitySeparator + guild;
    return entity;
}

function autoKey(ctx, type) {
    const view = types.get(type);
    const entity = ctx[view.type]?.id;
    if (view.guild) return entity + entitySeparator + ctx.guild.id;
    return entity;
}

function qev(args) {
    const l = args.length;
    if (l === 1) return;
    if (l === 2) return variables.get(args[1]);
    let key = args[1];
    for (let i = 2; i < l; i++) key += variableSeparator + args[i];
    return variables.get(key);
}

async function hold(type, key, name, duration) {
    const db = dbs.get(type);
    const original = db.get(key);
    const now = Date.now();
    if (original?.holds?.[name] > now) return false;
    const data = original ? { ...original } : {};
    let old;
    if (eventUpdate) {
        old = { ...data };
    }
    const holds = data.holds || (data.holds = {});
    holds[name] = now + duration;
    await db.put(key, data);
    if (eventUpdate) {
        emitter.emit("recordUpdate", { type, key, value: { old, new: data } });
    }
    return true;
}

function getRecord(type, key) {
    const value = dbs.get(type).get(key);
    return value ? { ...value } : {};
}

function valueRecord(type, key, name) {
    return dbs.get(type).get(key)?.[name] ?? variables.get(name);
}

function existsRecord(type, key) {
    return dbs.get(type).doesExist(key);
}

async function removeRecord(type, key) {
    const db = dbs.get(type);
    if (eventRemove) {
        const value = db.get(key);
        await db.remove(key);
        emitter.emit("recordRemove", { type, key, value });
    } else {
        await db.remove(key);
    }
}

async function putRecord(type, key, data) {
    const db = dbs.get(type);
    if (typeof data !== "object" || Array.isArray(data)) return false;
    if (Object.keys(data).length) {
        if (eventUpdate) {
            const old = db.get(key);
            await db.put(key, data);
            emitter.emit("recordUpdate", { type, key, value: { old, new: data } });
        } else {
            await db.put(key, data);
        }
    } else {
        if (eventRemove) {
            const value = db.get(key);
            await db.remove(key);
            emitter.emit("recordRemove", { type, key, value });
        } else {
            await db.remove(key);
        }
    }
    return true;
}

async function moveRecord(type, fromKey, toKey, deleteSource) {
    const db = dbs.get(type);
    const original = db.get(fromKey);
    if (!original) return false;
    const value = { ...original };
    if (eventUpdate) {
        const old = db.get(toKey);
        await db.put(toKey, value);
        emitter.emit("recordUpdate", { type, key: toKey, value: { old, new: value } });
    } else {
        await db.put(toKey, value);
    }
    if (deleteSource !== false) {
        if (eventRemove) {
            await db.remove(fromKey);
            emitter.emit("recordRemove", { type, key: fromKey, value });
        } else {
            await db.remove(fromKey);
        }
    }
    return true;
}

function leaderBoard(type, name, sorting, guild) {
    const is = types.get(type).guild;
    const items = [];
    for (const item of dbs.get(type).getRange({ snapshot: false })) {
        const key = item.key;
        const parts = key.indexOf(entitySeparator);
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
    const full = join(path, "backups", type);
    await rm(full, { recursive: true, force: true });
    await mkdir(full, { recursive: true });
    await dbs.get(type).backup(full);
}

async function removeBackup(type) {
    await rm(join(path, "backups", type), { recursive: true, force: true });
}

async function restoreBackup(type) {
    if (!types.has(type) || dbs.has(type)) return false;
    const db = join(path, "types", type);
    try {
        await access(db);
        return false;
    } catch {
        // it just works ¯\_(ツ)_/¯
    }
    const backup = join(path, "backups", type);
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
            if (!dbs.has(type)) {
                openDB([type]);
                await wait(3000);
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
            const db = dbs.get(type);
            const original = db.get(key);
            const data = original ? { ...original } : {};
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
    const migrationPath = join(path, "migration");
    const typesMigrate = await readdir(join(path, "types"));
    const oldFlags = options || {
        noReadAhead: true,
        noMemInit: true,
        cache: true
    };
    await cp(join(path, "types"), migrationPath, { recursive: true });
    for (const type of typesMigrate) {
        await rm(join(path, "types", type), { recursive: true, force: true });
        const oldDB = open({
            ...oldFlags,
            path: join(migrationPath, type)
        });
        const newDB = open({
            ...flags,
            useVersions: false,
            dupSort: false,
            path: join(path, "types", type)
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
    await new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    init,
    qev,
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
    prefetchDB,

    getRecord,
    valueRecord,
    existsRecord,
    removeRecord,
    moveRecord,
    putRecord,

    createBackup,
    removeBackup,
    restoreBackup
};