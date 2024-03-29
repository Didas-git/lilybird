import type { VoiceStateStructure } from "./gateway/voice.js";
import type { ChannelStructure } from "./gateway/channel.js";
import type { CacheElementType } from "../enums/cache.js";
import type { GuildStructure } from "./gateway/guild.js";
// import type { UserStructure } from "./shared/user.js";
import type { Awaitable } from "./utils.js";

export interface MapLike<T> {
    set: (id: string, payload: T) => Awaitable<this>;
    get: (id: string) => Awaitable<T | undefined>;
    delete: (id: string) => Awaitable<boolean>;
}

export interface CacheManagerStructure {
    // readonly users: MapLike<UserStructure>;
    readonly guilds: MapLike<GuildStructure>;
    readonly channels: MapLike<ChannelStructure>;
    readonly voiceStates: MapLike<VoiceStateStructure>;

    set: (type: CacheElementType, id: string, payload: unknown) => Awaitable<void>;
    get: (type: CacheElementType, id: string) => Awaitable<undefined | Record<string, unknown>>;
    delete: (type: CacheElementType, id: string) => Awaitable<boolean>;
}
