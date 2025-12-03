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
- Configuring **config.json** and **variables.json** files [View documentation](docs/STRUCTURE.md)
- Database migration for versions below **2.0.0** [View documentation](docs/MIGRATION.md)
- Database interaction using direct **JS** functions [View documentation](docs/FUNCTIONS.md)
- Database transfer from **ForgeDB** to **QuorielDB** [View documentation](docs/TRANSFER.md)