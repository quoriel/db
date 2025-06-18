# QuorielDB
An intuitive and high-performance interface for working with databases in ForgeScript, providing reliable and scalable data storage using LMDB.

## Installation
```
npm i github:quoriel/db lmdb
```

## Connection
```js
const { ForgeClient } = require("@tryforge/forgescript");
const { QuorielDB } = require("@quoriel/db");

const client = new ForgeClient({
    extensions: [
        new QuorielDB()
    ]
});

client.login("...");
```

## Config
The **config.json** file is located in the **quoriel/db** folder of your bot.  
- **separator** - the character that separates the entity and guild identifiers (default is `~`). Do not use this character in entity identifiers.
- **types** - a list of data types that the database will work with. For each type, specify the following parameters:
  - **type** - the type for automatic entity identifier detection (`user`, `member`, `guild`, `channel`, `role`, `message`). If set to `null`, the entity identifier must be provided explicitly.
  - **guild** - `true` or `false`. Determines whether to bind the data to a guild (for example, for member, channel, role, message).

## Default values
The **variables.json** file in the **quoriel/db** folder is intended for storing default variables. Initially, the file is empty — the user sets the required variables and their values themselves.