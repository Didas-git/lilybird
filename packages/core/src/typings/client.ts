import type { CacheManagerStructure } from "./cache-manager.js";
import type { CachingManager } from "../cache/manager.js";
import type { DispatchFunction } from "../ws/manager.js";
import type { Application } from "./application.js";
import type { Awaitable } from "./utils.js";

import type {
    CachingDelegationType,
    TransformerReturnType,
    CacheExecutionPolicy,
    DebugIdentifier
} from "#enums";

import type {
    ApplicationCommandPermissionsUpdate,
    AutoModerationActionExecution,
    GuildScheduledEventUserRemove,
    GuildScheduledEventUserAdd,
    MessageReactionRemoveEmoji,
    GuildScheduledEventCreate,
    GuildScheduledEventDelete,
    GuildScheduledEventUpdate,
    AutoModerationRuleCreate,
    AutoModerationRuleDelete,
    AutoModerationRuleUpdate,
    GuildAuditLogEntryCreate,
    MessageReactionRemoveAll,
    UpdatePresenceStructure,
    GuildIntegrationsUpdate,
    MessageReactionRemove,
    MessagePollVoteRemove,
    GuildStickersUpdate,
    StageInstanceCreate,
    StageInstanceUpdate,
    ThreadMembersUpdate,
    MessageReactionAdd,
    MessagePollVoteAdd,
    ThreadMemberUpdate,
    MessageDeleteBulk,
    IntegrationCreate,
    IntegrationDelete,
    IntegrationUpdate,
    InteractionCreate,
    VoiceServerUpdate,
    ChannelPinsUpdate,
    GuildMemberRemove,
    GuildEmojisUpdate,
    GuildMemberUpdate,
    GuildMembersChunk,
    VoiceStateUpdate,
    GuildRoleCreate,
    GuildRoleUpdate,
    PresenceUpdate,
    ThreadListSync,
    GuildRoleDelete,
    GuildMemberAdd,
    GuildBanRemove,
    MessageCreate,
    MessageDelete,
    ChannelCreate,
    ChannelDelete,
    ChannelUpdate,
    MessageUpdate,
    WebhookUpdate,
    InviteCreate,
    InviteDelete,
    ThreadCreate,
    ThreadDelete,
    ThreadUpdate,
    GuildBanAdd,
    GuildCreate,
    GuildDelete,
    GuildUpdate,
    TypingStart,
    UserUpdate,
    Ready
} from "./gateway-events.js";

export type Listeners<C, T extends Transformers<C>> = {
    [K in keyof T]?: T[K] extends { handler: unknown }
        ? (T[K] & {})["handler"] extends ((...args: any) => infer R)
            ? R extends [unknown, ...Array<unknown>] ? ((...arg: R) => Awaitable<unknown>) : ((arg: R) => Awaitable<unknown>)
            : never
        : (T[K] & { handler: unknown })["handler"] extends ((...args: infer U) => unknown)
            ? ((...args: U) => Awaitable<unknown>)
            : never
};

export type Transformer<C, T> = {
    return: TransformerReturnType,
    handler: (...args: [client: C, payload: T]) => unknown
};

export interface Transformers<C> {
    /**
     * Special case, its a `ready` handler that only fires once
     */
    setup?: Transformer<C, Ready["d"]>;
    ready?: Transformer<C, Ready["d"]>;
    resumed?: Transformer<C, undefined>;
    applicationCommandPermissionsUpdate?: Transformer<C, ApplicationCommandPermissionsUpdate["d"]>;
    autoModerationRuleCreate?: Transformer<C, AutoModerationRuleCreate["d"]>;
    autoModerationRuleUpdate?: Transformer<C, AutoModerationRuleUpdate["d"]>;
    autoModerationRuleDelete?: Transformer<C, AutoModerationRuleDelete["d"]>;
    autoModerationActionExecution?: Transformer<C, AutoModerationActionExecution["d"]>;
    channelCreate?: Transformer<C, ChannelCreate["d"]>;
    channelUpdate?: Transformer<C, ChannelUpdate["d"]>;
    channelDelete?: Transformer<C, ChannelDelete["d"]>;
    channelPinsUpdate?: Transformer<C, ChannelPinsUpdate["d"]>;
    threadCreate?: Transformer<C, ThreadCreate["d"]>;
    threadUpdate?: Transformer<C, ThreadUpdate["d"]>;
    threadDelete?: Transformer<C, ThreadDelete["d"]>;
    threadListSync?: Transformer<C, ThreadListSync["d"]>;
    threadMemberUpdate?: Transformer<C, ThreadMemberUpdate["d"]>;
    threadMembersUpdate?: Transformer<C, ThreadMembersUpdate["d"]>;
    guildCreate?: Transformer<C, GuildCreate["d"]>;
    guildUpdate?: Transformer<C, GuildUpdate["d"]>;
    guildDelete?: Transformer<C, GuildDelete["d"]>;
    guildAuditLogEntryCreate?: Transformer<C, GuildAuditLogEntryCreate["d"]>;
    guildBanAdd?: Transformer<C, GuildBanAdd["d"]>;
    guildBanRemove?: Transformer<C, GuildBanRemove["d"]>;
    guildEmojisUpdate?: Transformer<C, GuildEmojisUpdate["d"]>;
    guildStickersUpdate?: Transformer<C, GuildStickersUpdate["d"]>;
    guildIntegrationsUpdate?: Transformer<C, GuildIntegrationsUpdate["d"]>;
    guildMemberAdd?: Transformer<C, GuildMemberAdd["d"]>;
    guildMemberRemove?: Transformer<C, GuildMemberRemove["d"]>;
    guildMemberUpdate?: Transformer<C, GuildMemberUpdate["d"]>;
    guildMembersChunk?: Transformer<C, GuildMembersChunk["d"]>;
    guildRoleCreate?: Transformer<C, GuildRoleCreate["d"]>;
    guildRoleUpdate?: Transformer<C, GuildRoleUpdate["d"]>;
    guildRoleDelete?: Transformer<C, GuildRoleDelete["d"]>;
    guildScheduledEventCreate?: Transformer<C, GuildScheduledEventCreate["d"]>;
    guildScheduledEventUpdate?: Transformer<C, GuildScheduledEventUpdate["d"]>;
    guildScheduledEventDelete?: Transformer<C, GuildScheduledEventDelete["d"]>;
    guildScheduledEventUserAdd?: Transformer<C, GuildScheduledEventUserAdd["d"]>;
    guildScheduledEventUserRemove?: Transformer<C, GuildScheduledEventUserRemove["d"]>;
    integrationCreate?: Transformer<C, IntegrationCreate["d"]>;
    integrationUpdate?: Transformer<C, IntegrationUpdate["d"]>;
    integrationDelete?: Transformer<C, IntegrationDelete["d"]>;
    interactionCreate?: Transformer<C, InteractionCreate["d"]>;
    inviteCreate?: Transformer<C, InviteCreate["d"]>;
    inviteDelete?: Transformer<C, InviteDelete["d"]>;
    messageCreate?: Transformer<C, MessageCreate["d"]>;
    messageUpdate?: Transformer<C, MessageUpdate["d"]>;
    messageDelete?: Transformer<C, MessageDelete["d"]>;
    messageDeleteBulk?: Transformer<C, MessageDeleteBulk["d"]>;
    messageReactionAdd?: Transformer<C, MessageReactionAdd["d"]>;
    messageReactionRemove?: Transformer<C, MessageReactionRemove["d"]>;
    messageReactionRemoveAll?: Transformer<C, MessageReactionRemoveAll["d"]>;
    messageReactionRemoveEmoji?: Transformer<C, MessageReactionRemoveEmoji["d"]>;
    presenceUpdate?: Transformer<C, PresenceUpdate["d"]>;
    stageInstanceCreate?: Transformer<C, StageInstanceCreate["d"]>;
    stageInstanceUpdate?: Transformer<C, StageInstanceUpdate["d"]>;
    stageInstanceDelete?: Transformer<C, StageInstanceCreate["d"]>;
    typingStart?: Transformer<C, TypingStart["d"]>;
    userUpdate?: Transformer<C, UserUpdate["d"]>;
    voiceStateUpdate?: Transformer<C, VoiceStateUpdate["d"]>;
    voiceServerUpdate?: Transformer<C, VoiceServerUpdate["d"]>;
    webhookUpdate?: Transformer<C, WebhookUpdate["d"]>;
    messagePollVoteAdd?: Transformer<C, MessagePollVoteAdd["d"]>;
    messagePollVoteRemove?: Transformer<C, MessagePollVoteRemove["d"]>;
}

export interface SelectiveCache {
    create?: CacheExecutionPolicy;
    update?: CacheExecutionPolicy;
    delete?: CacheExecutionPolicy;
}

interface CacheWithoutTransformers {
    applyTransformers?: false;
}

interface CacheWithTransformers {
    applyTransformers: true;
    transformerTypes: {
        guild: unknown,
        channel: unknown,
        voiceState: unknown
    };
}

type ApplyTransformers = CacheWithTransformers | CacheWithoutTransformers;

export interface BaseCachingStructure {
    delegate: CachingDelegationType;
    manager?: CacheManagerStructure;
    enabled: {
        self?: CacheExecutionPolicy,
        guild?: boolean | SelectiveCache,
        channel?: boolean | (SelectiveCache & {
            threads?: boolean | SelectiveCache
        }),
        voiceState?: CacheExecutionPolicy
    };
    customKeys?: {
        guild_voice_states?: string,
        voice_state_user_id?: string,
        voice_state_channel_id?: string
    };
}

export interface ExternalCache extends BaseCachingStructure {
    delegate: CachingDelegationType.EXTERNAL;
    manager: CacheManagerStructure;
    safeToTransform?: boolean;
}

export interface TransformersCache extends BaseCachingStructure {
    delegate: CachingDelegationType.TRANSFORMERS;
}

export interface DefaultCache extends BaseCachingStructure {
    delegate: CachingDelegationType.DEFAULT;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ParseCachingManager<T extends CachingOptions> = T extends {}
    ? T["applyTransformers"] extends true
        ? T extends { transformerTypes: (infer U extends CacheWithTransformers["transformerTypes"]) }
            ? CachingManager<U["guild"], U["channel"], U["voiceState"]> : never
        : T["delegate"] extends CachingDelegationType.EXTERNAL
            ? T["manager"] & {}
            : CachingManager
    : never;

export type DebugFunction = (identifier: DebugIdentifier, payload?: unknown) => any;

export interface ClientOptions {
    intents: number;
    dispatch?: DispatchFunction;
    presence?: UpdatePresenceStructure;
    useDebugRest?: boolean;
    cachingManager?: CacheManagerStructure;
}

export type CachingOptions = (DefaultCache | ExternalCache | TransformersCache) & ApplyTransformers;

export interface MockClient {
    /** By default this is a UserStructure, but can change according to your transformers*/
    readonly user: any;
    readonly sessionId: string;
    readonly application: Application.Structure;
    readonly cache: CacheManagerStructure;
}
