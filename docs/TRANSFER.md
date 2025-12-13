# Data transfer
This function allows you to safely transfer data from **ForgeDB** to **QuorielDB**.

## Features
- Data transfer can be performed while **QuorielDB** is in use.
- Automatically opens databases in **QuorielDB** for all data types if they don't yet exist.
- Ignores records of the old `old` type - they won't be transferred to the new database.
- Variable values from **ForgeDB** are converted to JSON objects (if the value is an object).
- The `custom` data type from **ForgeDB** is transferred to `global`, and all discovered variables are bound to the `custom` key.
- For other types (`member`, `channel`, `role`, `message`), the key is formed taking the guild into account (guild binding depends on `config.json`).

## Function parameters
- **client** - An instance of `ForgeClient` with initialized **ForgeDB** and **QuorielDB** extensions.
- **rewrite** - Controls overwriting of existing data:
  - `false` - (default) - Adds new values while preserving existing ones.
  - `true` - Overwrites old values with new ones from **ForgeDB**.

## Usage
Ensure the **ForgeDB** and **QuorielDB** extensions are initialized in the client **before calling the transfer function**.

```js
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db")
const { QuorielDB, transferDatabase } = require("@quoriel/db");

const client = new ForgeClient({
    extensions: [
        new QuorielDB(),
        new ForgeDB()
    ]
});

// Transfer function, you must provide "client".
(async () => {
    await transferDatabase(client);
})();

// Or transfer data while overwriting existing variables in QuorielDB.
(async () => {
    await transferDatabase(client, true);
})();

client.login("...");
```