# QuorielDB
An intuitive and high-performance interface for working with databases in **ForgeScript**, providing reliable and scalable data storage using **LMDB**.

## Installation
```
npm i @quoriel/db lmdb
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielDB } = require("@quoriel/db");

const db = new QuorielDB({
    events: [
        "databaseConnect",
        "recordUpdate",
        "recordRemove"
    ]
});

const client = new ForgeClient({
    extensions: [
        db
    ]
});

// Loading events.
db.commands.load("events");

client.login("...");
```

## Useful
- Configuring the database to fit your bot's needs [View documentation](https://github.com/quoriel/db/blob/main/docs/CONFIG.md)
- Setting default values for missing data via schemas [View documentation](https://github.com/quoriel/edge/blob/main/docs/DEFAULTS.md)
- Migrating databases created with versions below **2.0.0** [View documentation](https://github.com/quoriel/db/blob/main/docs/MIGRATION.md)
- Interacting with the database using direct **JS** functions [View documentation](https://github.com/quoriel/db/blob/main/docs/FUNCTIONS.md)
- Transferring data from **ForgeDB** to **QuorielDB** [View documentation](https://github.com/quoriel/db/blob/main/docs/TRANSFER.md)
- Registering custom database types for extensions [View documentation](https://github.com/quoriel/db/blob/main/docs/REGISTER.md)