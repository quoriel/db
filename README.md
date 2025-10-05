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
        "dbConnect",
        "recordUpdate",
        "recordRemove"
    ]
});

const client = new ForgeClient({
    extensions: [
        db
    ]
});

// Loading QuorielDB events.
db.commands.load("events");

client.login("...");
```

## Config
The **config.json** file is located in the **quoriel/db** folder of your bot.  
- **separators** - This section defines characters used for separating keys in the database:
  - **entity** - the character that separates the entity and guild identifiers (default is `~`). Do not use this character in entity identifiers.
  - **variable** - Symbol for separating variable paths in data structures (default is `→`). Used to create hierarchical keys, e.g. `separators→variable`, to avoid conflicts - do not use in key names.
- **flags** - settings used for opening the database (via `$openDB`). Default keys are (`noReadAhead`, `noMemInit`, `cache`). Check the official **LMDB** documentation for additional database opening options.
- **types** - a list of data types that the database will work with. For each type, specify the following parameters:
  - **type** - the type for automatic entity identifier detection (`user`, `member`, `guild`, `channel`, `role`, `message`). If set to `null`, the entity identifier must be provided explicitly.
  - **guild** - `true` or `false`. Determines whether to bind the data to a guild (for example, for `member`, `channel`, `role`, `message`).

## Variables
The **variables.json** file in the **quoriel/db** folder is intended for storing default variables. Initially, the file is empty - the user sets the required variables and their values themselves.