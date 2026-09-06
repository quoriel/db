import { RootDatabase, RootDatabaseOptions } from "lmdb"
import { BaseCommandManager, Context, ForgeClient, ForgeExtension } from "@tryforge/forgescript"
import { Emitter } from "@eolthar/events"

/**
 * Stored record. Values are whatever the encoder round-trips.
 */
export type RecordData = Record<string, any>

/**
 * Entity a type resolves its identifier from, or `null` when the identifier
 * must be supplied explicitly.
 */
export type EntityType = "user" | "member" | "guild" | "channel" | "role" | "message"

/**
 * Declaration of a database type, as written in `config.json` or passed to
 * `registerDB`.
 */
export interface TypeSchema {
    /**
     * Context entity the identifier is taken from, `null` to require it.
     */
    type: EntityType | null

    /**
     * Whether keys of this type are bound to a guild.
     */
    guild: boolean
}

/**
 * LMDB options accepted for opening a database. The reserved ones - `path`,
 * `name`, `dupSort`, `useVersions`, `maxDbs`, `readOnly`, `noSubdir` - are
 * stripped and cannot be overridden.
 */
export type DatabaseFlags = Omit<
    RootDatabaseOptions,
    "path" | "name" | "dupSort" | "useVersions" | "maxDbs" | "readOnly" | "noSubdir"
> & {
    /**
     * Disables OS read-ahead caching. Missing from the LMDB typings.
     */
    noReadAhead?: boolean
}

/**
 * Events the extension can dispatch. Only the ones listed in the constructor
 * options are registered and emitted.
 */
export type EventName = "databaseConnect" | "recordUpdate" | "recordRemove" | "holdExpire"

/**
 * Runtime configuration, loaded from the `config.json` of the database folder.
 * Changing it after the databases are open is not supported.
 */
export interface Config {
    /**
     * Absolute path to the database folder.
     */
    path: string

    /**
     * Character joining the entity and guild parts of a composite key.
     */
    separator: string

    /**
     * Flags applied when a database is opened.
     */
    flags: DatabaseFlags

    /**
     * Which events are enabled, filled from the constructor options.
     */
    events: Record<EventName, boolean>
}

/**
 * Value kinds accepted by the `valueType` filter of `searchDB`. Numeric
 * strings are reported as `number`.
 */
export type ValueType = "string" | "number" | "boolean" | "object" | "array"

/**
 * Sorting direction of a leaderboard. Anything other than `asc` sorts
 * descending.
 */
export type SortingType = "asc" | "desc"

/**
 * Record returned by `rangeDB`.
 */
export interface RangeEntry {
    key: string
    value: RecordData
}

/**
 * Match returned by `searchDB`. `value` holds the whole record when no filter
 * was given, otherwise only the properties that matched.
 */
export interface SearchEntry {
    type: string
    key: string
    value: RecordData
}

/**
 * Leaderboard entry. `position` is one-based and assigned after sorting.
 */
export interface BoardEntry {
    key: string
    value: number
    position: number
}

/**
 * Result of `leaderBoard`.
 */
export interface Board {
    /**
     * Entity the ranked type resolves its identifiers from, `null` when they
     * are supplied explicitly.
     */
    type: EntityType | null

    items: BoardEntry[]
    count: number
}

/**
 * Payload of `recordUpdate`. `old` is absent when the key was not stored yet.
 */
export interface RecordUpdateData {
    type: string
    key: string
    value: {
        old?: RecordData
        new: RecordData
    }
}

/**
 * Payload of `recordRemove`, carrying the record as it was before deletion.
 */
export interface RecordRemoveData {
    type: string
    key: string
    value: RecordData
}

/**
 * Payload of `holdExpire`. `value` is the timestamp the hold expired at.
 */
export interface HoldExpireData {
    type: string
    key: string
    name: string
    value: number
}

/**
 * Arguments each event is emitted with.
 */
export interface DatabaseEvents {
    databaseConnect: []
    recordUpdate: [environment: RecordUpdateData]
    recordRemove: [environment: RecordRemoveData]
    holdExpire: [environment: HoldExpireData]
}

/**
 * Options of the `QuorielDB` constructor.
 */
export interface QuorielDBOptions {
    /**
     * Database folder, resolved against the working directory. Defaults to
     * `database`.
     */
    path?: string

    /**
     * Events to register. Events left out are never emitted, and the work
     * behind them is skipped.
     */
    events?: EventName[]
}

/**
 * ForgeScript extension exposing LMDB-backed storage.
 */
export declare class QuorielDB extends ForgeExtension {
    constructor(options?: QuorielDBOptions)

    name: string
    description: string
    version: string

    options?: QuorielDBOptions

    /**
     * Emitter the registered events are dispatched on.
     */
    emitter: Emitter<DatabaseEvents>

    /**
     * Loads a folder of event modules. Assigned during `init`.
     */
    commands: BaseCommandManager<EventName>

    init(client: ForgeClient): Promise<void>
}

/**
 * Registered types, keyed by type name.
 */
export declare const types: Map<string, TypeSchema>

/**
 * Active configuration.
 */
export declare const config: Config

/**
 * Builds a record key, taking the entity from the context when it is omitted.
 */
export declare function makeKey(ctx: Context, type: string, entity?: string, guild?: string): string

/**
 * Joins an entity and a guild into a record key, without touching the context.
 */
export declare function formatKey(type: string, entity: string, guild?: string): string

/**
 * Builds a record key entirely from the context.
 */
export declare function autoKey(ctx: Context, type: string): string

/**
 * Rebuilds every database with the given flags. Requires exclusive access.
 */
export declare function migrationDatabases(options?: DatabaseFlags): Promise<void>

/**
 * Copies data from ForgeDB, waiting for it to be ready. `rewrite` controls
 * whether existing fields are overwritten.
 */
export declare function transferDatabase(client: ForgeClient, rewrite?: boolean): Promise<void>

/**
 * Ranks records by a numeric field. Guild types keep only the given guild.
 */
export declare function leaderBoard(type: string, name: string, sorting?: SortingType, guild?: string): Board

/**
 * Names of the currently open databases.
 */
export declare function activeDB(): string[]

/**
 * Closes the given databases.
 */
export declare function closeDB(types: string[]): Promise<void>

/**
 * Every key of a database.
 */
export declare function keysDB(type: string): string[]

/**
 * Opens the given databases, skipping unknown and already open ones.
 */
export declare function openDB(types: string[]): void

/**
 * Round-trip time of a single read, in milliseconds.
 */
export declare function pingDB(type: string): number

/**
 * Closes the given databases and deletes their files.
 */
export declare function wipeDB(types: string[]): Promise<void>

/**
 * Every record of a database.
 */
export declare function rangeDB(type: string): RangeEntry[]

/**
 * Reloads `config.json` from the database folder.
 */
export declare function reloadDB(): Promise<void>

/**
 * Searches records by any combination of filters. Omitting `type` searches
 * every open database.
 */
export declare function searchDB(
    type?: string,
    name?: string,
    valueType?: ValueType,
    value?: string,
    entity?: string,
    guild?: string
): SearchEntry[]

/**
 * Declares a type and opens its database. Returns the handle, or `false` when
 * the schema is invalid. An existing type is returned untouched.
 */
export declare function registerDB(name: string, schema: TypeSchema, flags?: DatabaseFlags): RootDatabase<RecordData> | false

/**
 * Loads the given keys into memory.
 */
export declare function prefetchDB(type: string, keys: string[]): Promise<void>

/**
 * Copy of a record, empty when it is not stored.
 */
export declare function getRecord(type: string, key: string): RecordData

/**
 * `getRecord` against an already resolved handle.
 */
export declare function readRecord(db: RootDatabase<RecordData>, type: string, key: string): RecordData

/**
 * Single field of a record, falling back to the structure default when the
 * `structureDefaults` feature of QuorielEdge is enabled.
 */
export declare function valueRecord(type: string, key: string, name: string): any

/**
 * Whether a key is stored.
 */
export declare function existsRecord(type: string, key: string): boolean

/**
 * Deletes a record. Emits `recordRemove` when enabled.
 */
export declare function removeRecord(type: string, key: string): Promise<void>

/**
 * `removeRecord` against an already resolved handle. Resolves to the LMDB
 * result when `recordRemove` is disabled.
 */
export declare function deleteRecord(db: RootDatabase<RecordData>, type: string, key: string): Promise<boolean | void>

/**
 * Moves a record to another key, deleting the source unless `deleteSource` is
 * `false`. Returns `false` when the source is not stored.
 */
export declare function moveRecord(type: string, fromKey: string, toKey: string, deleteSource?: boolean): Promise<boolean>

/**
 * Stores a record, deleting the key when `data` is empty. Returns `false` when
 * `data` is not a plain object.
 */
export declare function putRecord(type: string, key: string, data: RecordData): Promise<boolean>

/**
 * `putRecord` against an already resolved handle, without the empty-object and
 * shape checks. Resolves to the LMDB result when `recordUpdate` is disabled.
 */
export declare function writeRecord(db: RootDatabase<RecordData>, type: string, key: string, data: RecordData): Promise<boolean | void>

/**
 * Replaces the backup of a type with a fresh one.
 */
export declare function createBackup(type: string): Promise<void>

/**
 * Deletes the backup of a type.
 */
export declare function removeBackup(type: string): Promise<void>

/**
 * Restores a type from its backup. Returns `false` when the database is
 * already present or open, or when there is no backup.
 */
export declare function restoreBackup(type: string): Promise<boolean>