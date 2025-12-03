# Database migration
This function allows you to rebuild all databases with new flags.

## Why is this needed?
- Starting with version **2.0.0**, critical flags `useVersions` and `dupSort` were added to **QuorielDB** that cannot be modified on existing databases without data loss. This function automatically migrates all your databases to the new settings.
- You can also use this function for personal purposes when you need to rebuild the database with new flags (for example, if you previously changed settings manually). The default flags are suitable for most cases; only change them if you fully understand the consequences.

## Before you begin
- Do not use the database while migration is in progress. It is recommended to run migration as a separate script or process, isolated from your main application, to prevent concurrent database operations.
- The function migrates **all** databases! This process cannot be configured for individual databases.
- Run only in a stable environment. Interrupting the process (power loss, reboot, disk error) will corrupt the database.
- **You must create a backup of all databases before migration!** Without a backup, data recovery after a failure will be impossible.

## Usage
```js
const { migrationDatabases } = require("@quoriel/db");

// Migration with old default flags
(async () => {
    await migrationDatabases();
})();

// Or with explicit flags (in case you previously changed flags manually)
(async () => {
    await migrationDatabases({
        noReadAhead: true,
        noMemInit: true,
        cache: true
    });
})();
```