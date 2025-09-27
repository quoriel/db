const { promises: { mkdir, writeFile, readFile } } = require("fs");
const { Logger } = require("@tryforge/forgescript");
const { resolve, join } = require("path");

const path = resolve(process.cwd(), "quoriel", "db");
const cache = new Map();
const dbs = new Map();
const variables = new Map();
const types = new Map();
let separator = "~";
let flags = {};

async function update() {
    await mkdir(path, { recursive: true });
    await rewrite("variables.json", "{}", variables);
    const content = await readFile(resolve(__dirname, "config.json"), "utf8");
    await rewrite("config.json", content);
}

function populate(map, object) {
    map.clear();
    for (const [key, value] of Object.entries(object)) {
        map.set(key, value);
    }
}

async function rewrite(name, content, map) {
    const full = join(path, name);
    await writeFile(full, content, { flag: "wx", encoding: "utf8" }).catch(() => {});
    try {
        const data = await readFile(full, "utf8");
        const parsed = JSON.parse(data);
        if (name === "config.json") {
            if (parsed.types) populate(types, parsed.types);
            separator = parsed.separator || "~";
            Object.keys(flags).forEach(key => delete flags[key]);
            Object.assign(flags, parsed);
        } else {
            populate(map, parsed);
        }
    } catch (error) {
        Logger.error(error);
    }
}

module.exports = { update, path, cache, dbs, variables, types, separator, flags };
