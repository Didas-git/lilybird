import type { InteractionStructure } from "./index.js";
import type { Intents, InteractionCollectorType, TransformerReturnType } from "#enums";
import type { Awaitable } from "./utils.js";
import type { Client } from "../client.js";

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
    ReceiveDispatchEvent,
    GuildStickersUpdate,
    StageInstanceCreate,
    StageInstanceUpdate,
    ThreadMembersUpdate,
    MessageReactionAdd,
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
} from "./gateway/gateway-events.js";

export type ClientListeners<T extends Transformers> = {
    [K in keyof T]?: T[K] extends { handler: unknown }
        ? (T[K] & {})["handler"] extends ((...args: any) => infer R)
            ? R extends [unknown, ...Array<unknown>] ? ((...arg: R) => Awaitable<unknown>) : ((arg: R) => Awaitable<unknown>)
            : never
        : (T[K] & { handler: unknown })["handler"] extends ((...args: infer U) => unknown)
            ? ((...args: U) => Awaitable<unknown>)
            : never
};

export type Transformer<T> = {
    return: TransformerReturnType,
    handler: (...args: [client: Client, payload: T]) => unknown
};

export interface Transformers {
    raw?: {
        return: TransformerReturnType,
        handler: (data: ReceiveDispatchEvent) => unknown
    };
    ready?: Transformer<Ready["d"]>;
    resumed?: Transformer<undefined>;
    applicationCommandPermissionsUpdate?: Transformer<ApplicationCommandPermissionsUpdate["d"]>;
    autoModerationRuleCreate?: Transformer<AutoModerationRuleCreate["d"]>;
    autoModerationRuleUpdate?: Transformer<AutoModerationRuleUpdate["d"]>;
    autoModerationRuleDelete?: Transformer<AutoModerationRuleDelete["d"]>;
    autoModerationActionExecution?: Transformer<AutoModerationActionExecution["d"]>;
    channelCreate?: Transformer<ChannelCreate["d"]>;
    channelUpdate?: Transformer<ChannelUpdate["d"]>;
    channelDelete?: Transformer<ChannelDelete["d"]>;
    channelPinsUpdate?: Transformer<ChannelPinsUpdate["d"]>;
    threadCreate?: Transformer<ThreadCreate["d"]>;
    threadUpdate?: Transformer<ThreadUpdate["d"]>;
    threadDelete?: Transformer<ThreadDelete["d"]>;
    threadListSync?: Transformer<ThreadListSync["d"]>;
    threadMemberUpdate?: Transformer<ThreadMemberUpdate["d"]>;
    threadMembersUpdate?: Transformer<ThreadMembersUpdate["d"]>;
    guildCreate?: Transformer<GuildCreate["d"]>;
    guildUpdate?: Transformer<GuildUpdate["d"]>;
    guildDelete?: Transformer<GuildDelete["d"]>;
    guildAuditLogEntryCreate?: Transformer<GuildAuditLogEntryCreate["d"]>;
    guildBanAdd?: Transformer<GuildBanAdd["d"]>;
    guildBanRemove?: Transformer<GuildBanRemove["d"]>;
    guildEmojisUpdate?: Transformer<GuildEmojisUpdate["d"]>;
    guildStickersUpdate?: Transformer<GuildStickersUpdate["d"]>;
    guildIntegrationsUpdate?: Transformer<GuildIntegrationsUpdate["d"]>;
    guildMemberAdd?: Transformer<GuildMemberAdd["d"]>;
    guildMemberRemove?: Transformer<GuildMemberRemove["d"]>;
    guildMemberUpdate?: Transformer<GuildMemberUpdate["d"]>;
    guildMembersChunk?: Transformer<GuildMembersChunk["d"]>;
    guildRoleCreate?: Transformer<GuildRoleCreate["d"]>;
    guildRoleUpdate?: Transformer<GuildRoleUpdate["d"]>;
    guildRoleDelete?: Transformer<GuildRoleDelete["d"]>;
    guildScheduledEventCreate?: Transformer<GuildScheduledEventCreate["d"]>;
    guildScheduledEventUpdate?: Transformer<GuildScheduledEventUpdate["d"]>;
    guildScheduledEventDelete?: Transformer<GuildScheduledEventDelete["d"]>;
    guildScheduledEventUserAdd?: Transformer<GuildScheduledEventUserAdd["d"]>;
    guildScheduledEventUserRemove?: Transformer<GuildScheduledEventUserRemove["d"]>;
    integrationCreate?: Transformer<IntegrationCreate["d"]>;
    integrationUpdate?: Transformer<IntegrationUpdate["d"]>;
    integrationDelete?: Transformer<IntegrationDelete["d"]>;
    interactionCreate?: Transformer<InteractionCreate["d"]>;
    inviteCreate?: Transformer<InviteCreate["d"]>;
    inviteDelete?: Transformer<InviteDelete["d"]>;
    messageCreate?: Transformer<MessageCreate["d"]>;
    messageUpdate?: Transformer<MessageUpdate["d"]>;
    messageDelete?: Transformer<MessageDelete["d"]>;
    messageDeleteBulk?: Transformer<MessageDeleteBulk["d"]>;
    messageReactionAdd?: Transformer<MessageReactionAdd["d"]>;
    messageReactionRemove?: Transformer<MessageReactionRemove["d"]>;
    messageReactionRemoveAll?: Transformer<MessageReactionRemoveAll["d"]>;
    messageReactionRemoveEmoji?: Transformer<MessageReactionRemoveEmoji["d"]>;
    presenceUpdate?: Transformer<PresenceUpdate["d"]>;
    stageInstanceCreate?: Transformer<StageInstanceCreate["d"]>;
    stageInstanceUpdate?: Transformer<StageInstanceUpdate["d"]>;
    stageInstanceDelete?: Transformer<StageInstanceCreate["d"]>;
    typingStart?: Transformer<TypingStart["d"]>;
    userUpdate?: Transformer<UserUpdate["d"]>;
    voiceStateUpdate?: Transformer<VoiceStateUpdate["d"]>;
    voiceServerUpdate?: Transformer<VoiceServerUpdate["d"]>;
    webhookUpdate?: Transformer<WebhookUpdate["d"]>;
}

export type CollectorMatcher<T extends Transformers> = (interaction: ExtractInteractionForCollector<T>) => boolean;
export type CollectorMatchedCallback<T extends Transformers> = (interaction: ExtractInteractionForCollector<T>) => Awaitable<any>;

export type ExtractInteractionForCollector<T extends Transformers> = T["interactionCreate"] extends undefined
    ? InteractionStructure
    : T["interactionCreate"] extends { handler: unknown }
        ? (T["interactionCreate"] & {})["handler"] extends ((...args: any) => infer R)
            ? R
            : never
        : (T["interactionCreate"] & { handler: unknown })["handler"] extends ((...args: infer U) => unknown)
            ? U
            : never;

export interface BaseClientOptions<T extends Transformers> {
    intents: number;
    listeners: ClientListeners<T>;
    transformers?: T;
    presence?: UpdatePresenceStructure;
    collectors?: {
        interactions?: InteractionCollectorType
    };
    setup: (client: Client) => Awaitable<any>;
}

export interface ClientOptions<T extends Transformers> extends Omit<BaseClientOptions<T>, "intents" | "setup"> {
    intents: Array<Intents> | number;
    token: string;
    attachDebugListener?: boolean;
    debugListener?: (identifier: string, payload: unknown) => void;
    setup?: (client: Client) => Awaitable<any>;
}
