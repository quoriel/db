# Registering database types
This document explains how **extensions** (third-party code built on top of QuorielDB) can declare and open their own database types at runtime, without requiring the bot owner to edit `config.json` manually.

If you only build bots on top of **QuorielDB**, the types defined in `config.json` (see [CONFIG.md](https://github.com/quoriel/db/blob/main/docs/CONFIG.md#types)) are enough, and you can skip this.

## registerDB
`registerDB` lets an extension declare and open its own database type at runtime. It follows the same schema rules as `config.json` [types](https://github.com/quoriel/db/blob/main/docs/CONFIG.md#types) - `type` must be `null` or one of `user`, `member`, `guild`, `channel`, `role`, `message`, and `guild` must be a boolean. If the schema is invalid, the type is not registered and `false` is returned.

If the type was already registered (by `config.json` or by another extension), the existing schema is kept as-is and the already-open database handle is returned - `registerDB` never overwrites a schema or reopens a database that already exists.

```js
const { registerDB } = require("@quoriel/db");

const db = registerDB("myExtensionType", {
    type: null,
    guild: false
});

if (db === false) {
    // Invalid schema - registration failed.
} else {
    // db is the LMDB database handle, ready to use.
}
```

Optional flags can be passed as the third argument, the same LMDB options accepted by `config.json`'s [flags](https://github.com/quoriel/db/blob/main/docs/CONFIG.md#flags) section:

```js
const db = registerDB("myExtensionType", { type: null, guild: false }, {
    noReadAhead: true,
    noMemInit: true,
    cache: true
});
```

These flags only apply to **this** type's database, they don't affect `config.json`'s global `flags` or any other registered type. Reserved flags (`path`, `name`, `dupSort`, `useVersions`, `maxDbs`, `readOnly`, `noSubdir`) are always stripped, they cannot be overridden by extensions either. Flags are only used the first time the type is opened - if the type already exists, the third argument is ignored.