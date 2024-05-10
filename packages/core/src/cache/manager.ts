/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CacheElementType } from "../enums/cache.js";
import type { CacheManagerStructure, Channel, Guild, Voice } from "../typings/index.js";

export class CachingManager<G = Guild.Structure, C = Channel.Structure, V = Voice.StateStructure> implements CacheManagerStructure {
    public readonly guilds = new Map<string, G>();
    public readonly channels = new Map<string, C>();
    public readonly voiceStates = new Map<string, V>();

    public set(type: CacheElementType, id: string, payload: any): void {
        switch (type) {
            case CacheElementType.GUILD: {
                this.guilds.set(id, payload);
                break;
            }
            case CacheElementType.CHANNEL: {
                this.channels.set(id, payload);
                break;
            }
            case CacheElementType.VOICE_STATE: {
                this.voiceStates.set(id, payload);
                break;
            }
        }
    }

    public get(type: CacheElementType, id: string): Record<string, unknown> | undefined {
        switch (type) {
            case CacheElementType.GUILD: {
                return this.guilds.get(id) as never;
            }
            case CacheElementType.CHANNEL: {
                return this.channels.get(id) as never;
            }
            case CacheElementType.VOICE_STATE: {
                return this.voiceStates.get(id) as never;
            }
        }
    }

    public delete(type: CacheElementType, id: string): boolean {
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
