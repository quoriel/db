const { existsSync } = require("fs");
const { mkdir, writeFile, readFile } = require("fs").promises;
const { resolve, join } = require("path");

const path = resolve(process.cwd(), "quoriel", "db");
const cache = new Map();
const dbs = new Map();

let variables = {};
let config = {};

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

module.exports = {
    update,
    cache,
    dbs,
    variables,
    config,
    path
};