import { createClient } from "@redis/client";
import { CacheElementType } from "lilybird";
import RedisJSON from "@redis/json";

import type { RedisClientType } from "@redis/client";
import type { CacheManagerStructure, Channel, Guild, MapLike, Voice } from "lilybird";

export type NodeRedisClient = RedisClientType<{ json: typeof RedisJSON.default }>;

export class Redis {
    /** @internal */
    public connection: NodeRedisClient;

    public constructor(urlOrClient: string | NodeRedisClient) {
        if (typeof urlOrClient === "string")
            this.connection = createClient({ url: urlOrClient, modules: { json: RedisJSON.default } });
        else this.connection = urlOrClient;

        if (typeof this.connection.json === "undefined") throw new Error("Lilybird's Redis caching module requires RedisJSON to work");
    }

    public async open(): Promise<void> {
        await this.connection.connect();
    }

    public getCacheManager(): RedisCacheManager {
        return new RedisCacheManager(this.connection);
    }
}

export interface CacheField {
    key: string;
    type: unknown;
}

type MapCacheFields<T extends Record<string, CacheField>> = {
    readonly [K in keyof T]: IndividualCacheManager<T[K]["type"]>
};

export class RedisCacheManager implements CacheManagerStructure {
    public readonly guilds: IndividualCacheManager<Guild.Structure>;
    public readonly channels: IndividualCacheManager<Channel.Structure>;
    public readonly voiceStates: IndividualCacheManager<Voice.StateStructure>;

    readonly #connection: NodeRedisClient;

    /**
     * @param connection - An open connection to redis
     */
    public constructor(connection: NodeRedisClient) {
        this.#connection = connection;
        this.guilds = new IndividualCacheManager(connection, "Lilybird:Cache:Guild");
        this.channels = new IndividualCacheManager(connection, "Lilybird:Cache:Channel");
        this.voiceStates = new IndividualCacheManager(connection, "Lilybird:Cache:VoiceState");
    }

    public add<T extends Record<string, CacheField>>(fields: T): RedisCacheManager & MapCacheFields<T> {
        for (let i = 0, entries = Object.entries(fields), { length } = entries; i < length; i++) {
            const [key, value] = entries[i];
            //@ts-expect-error This is intended, i don't want to add an index signature to the class
            this[key] = new IndividualCacheManager(this.#connection, value.key);
        }

        return <never> this;
    }

    public async set(type: CacheElementType, id: string, payload: unknown): Promise<void> {
        switch (type) {
            case CacheElementType.GUILD: {
                await this.guilds.set(id, <never>payload);
                break;
            }
            case CacheElementType.CHANNEL: {
                await this.channels.set(id, <never>payload);
                break;
            }
            case CacheElementType.VOICE_STATE: {
                await this.voiceStates.set(id, <never>payload);
                break;
            }
        }
    }

    public async get(type: CacheElementType, id: string): Promise<Record<string, unknown> | undefined> {
        switch (type) {
            case CacheElementType.GUILD: {
                return await this.guilds.get(id) as never;
            }
            case CacheElementType.CHANNEL: {
                return await this.channels.get(id) as never;
            }
            case CacheElementType.VOICE_STATE: {
                return await this.voiceStates.get(id) as never;
            }
        }
    }

    public async delete(type: CacheElementType, id: string): Promise<boolean> {
        switch (type) {
            case CacheElementType.GUILD: {
                return this.guilds.delete(id);
            }
            case CacheElementType.CHANNEL: {
                return this.channels.delete(id);
            }
            case CacheElementType.VOICE_STATE: {
                return this.voiceStates.delete(id);
            }
        }
    }
}

class IndividualCacheManager<T> implements MapLike<T> {
    readonly #connection: NodeRedisClient;
    readonly #key: string;

    public constructor(connection: NodeRedisClient, key: string) {
        this.#connection = connection;
        this.#key = key;
    }

    public async set(id: string, payload: T): Promise<this> {
        await this.#connection.json.set(`${this.#key}:${id}`, "$", <never>payload);
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async get(id: string): Promise<T | undefined> {
        return <T> this.#connection.json.get(`${this.#key}:${id}`);
    }

    public async delete(id: string): Promise<boolean> {
        const deletedCount = await this.#connection.del(`${this.#key}:${id}`);
        return deletedCount > 0;
    }
}
