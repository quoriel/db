# Interaction functions
This section describes all functions for direct interaction with the **QuorielDB** database. These functions allow you to manage databases, work with records, create backups, and perform other operations directly from **JavaScript** code.

```js
const { leaderBoard, reloadDB, activeDB, openDB } = require("@quoriel/db");

(async () => {
    // Reloads the database configuration from files.
    await reloadDB();

    // Opens the "user" and "member" databases.
    openDB(["user", "member"]);

    // All active databases.
    console.log(`All active databases: ${activeDB().join(", ")}`);

    // Leaderboard.
    const board = leaderBoard("user", "cash", "desc");
    let output = `Leaderboard (${board.count} total entries):\n`;
    for (let i = 0, l = board.count; i < l; i++) {
        const item = board.items[i];
        output += `- ${item.position} - ${item.key} - ${item.value}\n`;
    }
    console.log(output);
})();
```

## Working with Keys (Entity, Guild, and Key)
**QuorielDB** uses a **two-level record identification system** that often causes confusion. The key to understanding is the difference between **separate parameters** (`entity` and `guild`) and a **composite key** (`key`). These approaches are not interchangeable, and incorrect application leads to errors that are difficult to debug.

### Level 1: Separate parameters (`entity` and `guild`)
Some functions, such as `searchDB`, accept `entity` and `guild` as **separate arguments**. This is done for convenient filtering: you can pass `null` to any of the parameters to ignore that search criterion. A separator between these values **is not used** at the parameter level - the function itself knows how to combine them when executing the query.

```js
// Search for a record with a specific entity and guild.
searchDB("member", null, null, null, "123456789", "987654321");
//                                    ↑ entity      ↑ guild
```

### Level 2: Composite key (`key`)
Other functions, such as `getRecord`, work with **a single parameter `key`**. This **does not** mean that `entity` and `guild` are combined into an object. It means they are already **joined into a string** with a separator specified in your `config.json` (default is `~`).

```js
// Simple key (for types without guild binding).
getRecord("user", "123456789");

// Composite key (entity~guild).
getRecord("member", "123456789~987654321");
```

**All responsibility lies with you here**. You must know which types require a guild and correctly format the string. If you pass a composite key to a function that doesn't support guilds, you'll get a record with an incorrect name.

## Helper functions
These functions exist to free you from manually concatenating identifiers and guessing whether a guild is needed for the selected data type. They handle the routine work and let you work with entities more simply - as if you're passing intentions rather than strings.

### makeKey - smart automation
It understands context and can extract necessary values on its own if you don't specify them. If you pass IDs manually, it just combines them, no questions asked.

```js
// Automatically populates member.id and guild.id from ctx.
makeKey(ctx, "member"); // "123456789~987654321"

// If you pass an explicit ID, it just combines them.
makeKey(ctx, "member", "111", "222"); // "111~222"
```

### autoKey - pure automation
Extracts everything from context automatically, no manual IDs allowed.
```js
// Automatically populates member.id and guild.id from ctx.
autoKey(ctx, "member"); // "123456789~987654321"
```

### formatKey - a straightforward workhorse
No guesswork: it takes only what you pass to it and combines them.

```js
formatKey("member", "111", "222"); // "111~222"
```

### When you can skip these functions
If the type **doesn't require guild binding** (`global`, `user`, `guild`), you can pass IDs directly to `key`, bypassing the helpers:

```js
// Direct access without additional tools.
getRecord("user", "123456789");
putRecord("global", "bot", { "count-member": "42" });
```

### Helpers are needed when:
- The type **must** be bound to a guild (`member`, `channel`, `role`, ...).
- The type is dynamic and you're unsure if it requires a guild.
- You're working in a context and want the functions to automatically extract the necessary IDs.

## Functions
All parameters marked with "?" are optional, they can be omitted entirely or passed as `null` or `undefined`.

## Backup
### `createBackup(type: string): Promise<void>`
Creates a database backup of the specified type.

### `removeBackup(type: string): Promise<void>`
Deletes the database backup of the specified type.

### `restoreBackup(type: string): Promise<boolean>`
Restores the database from backup. Returns `true` on success, `false` if the database is already open or the backup is not found.

## DB
### `wipeDB(types: string[]): Promise<void>`
Closes and completely deletes the specified databases.

### `closeDB(types: string[]): Promise<void>`
Closes the specified databases.

### `openDB(types: string[]): void`
Opens the specified databases if they exist in the configuration.

### `activeDB(): string[]`
Returns an array of all active (open) database names.

### `pingDB(type: string): number`
Measures the database response time in milliseconds.

### `keysDB(type: string): string[]`
Returns an array of all keys in the specified database.

### `rangeDB(type: string): Array<{ key: string; value: object }>`
Returns all records from the specified database.

### `reloadDB(): Promise<void>`
Reloads configuration (`config.json` and `variables.json`) from files.

### `searchDB(type?: string, name?: string, valueType?: "string" | "number" | "boolean" | "object" | "array", value?: string, entity?: string, guild?: string): Array<{ type: string; key: string; value: object }>`
Searches for records by given criteria.

### `prefetchDB(type: string, keys: string[]): Promise<void>`
Preloads the specified keys into memory to speed up subsequent record operations.

## Record
### `getRecord(type: string, key: string): object`
Gets a copy of the data by key. Returns an empty object if the record is not found.

### `valueRecord(type: string, key: string, name: string): any`
Gets the value of a specific field from a record. Returns the default value if the field is not found.

### `existsRecord(type: string, key: string): boolean`
Checks if a record exists by key.

### `removeRecord(type: string, key: string): Promise<void>`
Deletes a record by key. Triggers the `recordRemove` event if enabled.

### `moveRecord(type: string, fromKey: string, toKey: string, deleteSource?: boolean): Promise<boolean>`
Moves a record from one key to another. Deletes the source record by default (`deleteSource = true`). Returns `false` if the source record is not found.

### `putRecord(type: string, key: string, data: object): Promise<boolean>`
Saves or updates a record. If `data` is an empty object, the record is deleted. Returns `false` if `data` is not an object or array. Triggers `recordUpdate`/`recordRemove` events if enabled.

## Single
### `leaderBoard(type: string, name: string, sorting: "asc" | "desc", guild?: string): { items: Array<{ key: string; value: number; position: number }>; count: number }`
Creates a leaderboard based on a numeric field. For guild types, you can specify a guild ID for filtering.

### `hold(type: string, key: string, name: string, duration: number): Promise<boolean>`
Sets a delay on the record field for the specified time in milliseconds and returns true if it was set, otherwise false. Triggers `recordUpdate` events if enabled.

## Other
### `migrationDatabases(options?: object): Promise<void>`
Migrates databases with new flags [View documentation](MIGRATION.md)

### `transferDatabase(client: ForgeClient, rewrite?: boolean): Promise<void>`
Transfers data from ForgeDB to QuorielDB. The `rewrite` parameter determines whether existing fields are overwritten [View documentation](TRANSFER.md)

### `makeKey(ctx: object, type: string, entity?: string, guild?: string): string`
Constructs the record key based on context. Automatically extracts the entity ID from the context if not provided.

### `autoKey(ctx: object, type: string): string`
Automatically constructs the record key from context based on type configuration.

### `formatKey(type: string, entity: string, guild?: string): string`
Formats the record key based on type and guild (for guild types).