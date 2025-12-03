# File structure
This document describes the structure, purpose, and configuration process for the `config.json` and `variables.json` files located in your bot's `quoriel/db` directory.

## config.json
The file defines the separators, database flags, and supported data types.

### separators
Characters used to construct compound keys and variable paths. **Warning: Changing these after database creation will make existing keys unreadable.**
- **entity** (string) - The character that separates the entity and guild identifiers. Do not use this character in entity identifiers.
- **variable** (string) - Symbol for separating variable paths in data structures. Used to create hierarchical variables, to avoid conflicts - do not use in variable names.

### flags
Settings used for opening the database (via `$openDB`). Check the official **LMDB** documentation for additional database opening options.
- **noReadAhead** (boolean) - Disables OS read-ahead caching. May improve random reads when DB exceeds RAM. **Not supported on Windows, incompatible with page sizes > 4096.**
- **noMemInit** (boolean) - Skips zeroing malloc'ed memory for faster writes. Can leave data remnants in unused DB space. Safe only if physical file access is secure.
- **cache** (boolean) - Enables in-memory object caching for faster reads. Data is cached locally per process. See LMDB docs for advanced multi-worker configurations.

> [!NOTE]
> The following flags are automatically excluded from configuration and cannot be overridden: `path`, `name`, `dupSort`, `useVersions`, `maxDbs`, `readOnly`, `noSubdir`. These flags are managed internally by **QuorielDB** to ensure database integrity.

### types
Configuration of supported data types. For each type, define two parameters:
- **type** (string or null) - The type for automatic entity identifier detection (`user`, `member`, `guild`, `channel`, `role`, `message`). If set to `null`, the entity identifier must be provided explicitly.
- **guild** (boolean) - Determines whether to bind the data to a guild (for example, for `member`, `channel`, `role`, `message`).

## variables.json
Used to store default variable values. Initially the file is empty - you define the necessary variables and their values yourself.

```js
{
    "welcome": "HELLO BRO!",
    "cash": 0
}
```

### Usage
```js
// Function $valueRecord[].
$valueRecord[user;cash] // 0 (if the variable existed in the user's data, its value would be returned).

// Function $getRecord[] and $qev[].
$getRecord[user;var]
$env[var;cash] // empty (assuming the user's data has no "cash" variable).
$qev[var;cash] // 0 (default value from "variables.json")
```