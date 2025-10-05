const { promises: { mkdir, writeFile, readFile } } = require("fs");
const { Logger } = require("@tryforge/forgescript");
const { resolve, join } = require("path");

const path = resolve(process.cwd(), "quoriel", "db");
const cache = new Map();
const dbs = new Map();
const variables = new Map();
const types = new Map();
const flags = {};
const config = {
    eventUpdate: false,
    eventRemove: false,
    entitySeparator: "~",
    variableSeparator: "→",
    emitter: null
};

async function initializer(heavens, sails) {
    await reload();
    config.emitter = heavens;
    config.eventUpdate = sails?.includes("recordUpdate") || false;
    config.eventRemove = sails?.includes("recordRemove") || false;
    config.emitter.emit("dbConnect");
}

async function reload() {
    await mkdir(path, { recursive: true });
    const content = await readFile(resolve(__dirname, "config.json"), "utf8");
    await rewrite("config.json", content);
    await rewrite("variables.json", "{}");
}

async function rewrite(name, content) {
    const full = join(path, name);
    await writeFile(full, content, { flag: "wx", encoding: "utf8" }).catch(() => {});
    try {
        const data = await readFile(full, "utf8");
        const parsed = JSON.parse(data);
        if (name === "config.json") {
            if (parsed.separators) {
                config.entitySeparator = parsed.separators.entity || "~";
                config.variableSeparator = parsed.separators.variable || "→";
            }
            if (parsed.flags) {
                Object.keys(flags).forEach(key => delete flags[key]);
                Object.assign(flags, parsed.flags);
            }
            if (parsed.types) {
                types.clear();
                for (const [key, value] of Object.entries(parsed.types)) types.set(key, value);
            }
        } else {
            variables.clear();
            populate(variables, parsed);
        }
    } catch (error) {
        Logger.error(error);
    }
}

function populate(map, object, prefix = "") {
    let has = false;
    for (const [key, value] of Object.entries(object)) {
        has = true;
        const full = prefix ? `${prefix}${variableSeparator}${key}` : key;
        if (Array.isArray(value)) {
            map.set(full, value);
            value.forEach((item, index) => {
                const itemKey = `${full}${variableSeparator}${index}`;
                if (item !== null && typeof item === "object" && !Array.isArray(item)) {
                    populate(map, item, itemKey);
                } else if (item !== "") {
                    map.set(itemKey, item);
                }
            });
        } else if (value !== null && typeof value === "object") {
            populate(map, value, full);
        } else if (value !== "") {
            map.set(full, value);
        }
    }
    if (!has && prefix && typeof object === "object" && !Array.isArray(object)) {
        map.set(prefix, object);
    }
}

module.exports = {
    reload,
    initializer,
    path,
    cache,
    dbs,
    variables,
    types,
    flags,
    config
};