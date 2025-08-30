const { existsSync } = require("fs");
const { mkdir, writeFile, readFile } = require("fs").promises;
const { resolve, join } = require("path");
const { log } = require("@quoriel/utils");

const path = resolve(process.cwd(), "quoriel", "db");
const cache = new Map();
const dbs = new Map();

let variables = {};
let config = {};

async function update() {
    const results = [];
    await mkdir(path, { recursive: true });
    results.push(await rewrite("variables.json", variables, "{}"));
    const data = await readFile(resolve(__dirname, "config.json"), "utf8");
    results.push(await rewrite("config.json", config, data));
    return results;
}

async function rewrite(name, target, content) {
    const full = join(path, name);
    if (!existsSync(full)) {
        await writeFile(full, content, "utf8");
    }
    try {
        const data = await readFile(full, "utf8");
        for (const key of Object.keys(target)) {
            delete target[key];
        }
        const parsed = JSON.parse(data);
        Object.assign(target, parsed);
        return true;
    } catch (error) {
        log("ERROR", "updateVar", `Failed to parse JSON from "${name}"`, error.message);
        return false;
    }
}

module.exports = {
    update,
    cache,
    dbs,
    variables,
    config,
    path
};