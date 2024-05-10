import type { CacheElementType } from "../enums/cache.js";
import type { Awaitable } from "./utils.js";

export interface MapLike<T> {
    set: (id: string, payload: T) => Awaitable<this>;
    get: (id: string) => Awaitable<T | undefined>;
    delete: (id: string) => Awaitable<boolean>;
}

export interface CacheManagerStructure {
    readonly guilds: MapLike<any>;
    readonly channels: MapLike<any>;
    readonly voiceStates: MapLike<any>;

    set: (type: CacheElementType, id: string, payload: unknown) => Awaitable<void>;
    get: (type: CacheElementType, id: string) => Awaitable<undefined | Record<string, unknown>>;
    delete: (type: CacheElementType, id: string) => Awaitable<boolean>;
}
