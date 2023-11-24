import type {
    AutoModerationTriggerType,
    InviteTargetType,
    GatewayOpCode,
    GatewayEvent
} from "../enums";

import type {
    ApplicationCommandPermissionsStructure,
    AutoModerationActionStructure,
    AutoModerationRuleStructure,
    GuildScheduleEventStructure,
    UnavailableGuildStructure,
    StageInstanceStructure,
    AuditLogEntryStructure,
    ThreadChannelStructure,
    ThreadMemberStructure,
    IntegrationStructure,
    GuildMemberStructure,
    ApplicationStructure,
    InteractionStructure,
    VoiceStateStructure,
    ActivityStructure,
    ChannelStructure,
    StickerStructure,
    MessageStructure,
    GuildStructure,
    EmojiStructure,
    UserStructure,
    RoleStructure
} from ".";

export interface GetGatewayResponse {
    /** Gateway Websocket URL */
    url: string;
}

export interface GetGatewayBotResponse extends GetGatewayResponse {
    shards: number;
    session_start_limit: {
        total: number,
        remaining: number,
        reset_after: number,
        max_concurrency: number
    };
}

export type Payload = ReceiveEvent | SendEvent;

export interface BasePayload {
    /** Gateway OpCode */
    op: GatewayOpCode;
    /** Event Data (Any JSON value) */
    d: unknown;
    /** Sequence Number */
    s: number | null;
    /** Event Name */
    t: GatewayEvent | null;
}

export interface DispatchPayload extends BasePayload {
    op: GatewayOpCode.Dispatch;
    s: number;
    t: GatewayEvent;
}

export type Status = "online" | "dnd" | "idle" | "invisible" | "offline";

export interface ClientStatus {
    desktop?: string;
    mobile?: string;
    web?: string;
}

export interface UpdatePresenceStructure {
    since: number | null;
    /** I will type this properly later */
    activities: Array<ActivityStructure>;
    status: Status;
    afk: boolean;
}

export interface PresenceUpdateEventFields {
    user: Partial<UserStructure> & {
        id: string
    };
    guild_id: string;
    status: string;
    activities: Array<ActivityStructure>;
    client_status: ClientStatus;
}

//#region SendEvent

export type SendEvent = Identify
    | Resume
    | Heartbeat
    | RequestGuildMembers
    | UpdateVoiceState
    | UpdatePresence
    | HeartbeatACK;

export interface Identify extends BasePayload {
    op: GatewayOpCode.Identify;
    d: {
        token: string,
        properties: {
            os: string,
            browser: "LilyBird",
            device: "LilyBird"
        },
        /** @defaultValue false */
        compress?: boolean,
        /**
         * Value between 50 and 250
         * @defaultValue 50
        */
        large_threshold?: number,
        shard?: [number, number],
        presence?: UpdatePresenceStructure,
        intents: number
    };
}

export interface Resume extends BasePayload {
    op: GatewayOpCode.Resume;
    d: {
        token: string,
        session_id: string,
        seq: number
    };
}

export interface Heartbeat extends BasePayload {
    op: GatewayOpCode.Heartbeat;
    d: number | null;
}

export interface RequestGuildMembers extends BasePayload {
    op: GatewayOpCode.RequestGuildMembers;
    d: {
        guild_id: string,
        query?: string,
        limit: number,
        presences?: boolean,
        user_ids?: string | Array<string>,
        nonce?: string
    };
}

export interface UpdateVoiceState extends BasePayload {
    op: GatewayOpCode.VoiceStateUpdate;
    d: {
        guild_id: string,
        channel_id: string | null,
        self_mute: boolean,
        self_deaf: boolean
    };
}

export interface UpdatePresence extends BasePayload {
    op: GatewayOpCode.PresenceUpdate;
    d: UpdatePresenceStructure;
}

export interface HeartbeatACK extends BasePayload {
    op: GatewayOpCode.HeartbeatACK;
}

//#endregion SendEvent

//#region ReceiveEvent

export type ReceiveDispatchEvent = Ready
    | Resumed
    | ApplicationCommandPermissionsUpdate
    | AutoModerationRuleCreate
    | AutoModerationRuleUpdate
    | AutoModerationRuleDelete
    | AutoModerationActionExecution
    | ChannelCreate
    | ChannelUpdate
    | ChannelDelete
    | ChannelPinsUpdate
    | ThreadCreate
    | ThreadUpdate
    | ThreadDelete
    | ThreadListSync
    | ThreadMemberUpdate
    | ThreadMembersUpdate
    | GuildCreate
    | GuildUpdate
    | GuildDelete
    | GuildAuditLogEntryCreate
    | GuildBanAdd
    | GuildBanRemove
    | GuildEmojisUpdate
    | GuildStickersUpdate
    | GuildIntegrationsUpdate
    | GuildMemberAdd
    | GuildMemberRemove
    | GuildMemberUpdate
    | GuildMembersChunk
    | GuildRoleCreate
    | GuildRoleUpdate
    | GuildRoleDelete
    | GuildScheduledEventCreate
    | GuildScheduledEventUpdate
    | GuildScheduledEventDelete
    | GuildScheduledEventUserAdd
    | GuildScheduledEventUserRemove
    | IntegrationCreate
    | IntegrationUpdate
    | IntegrationDelete
    | InteractionCreate
    | InviteCreate
    | InviteDelete
    | MessageCreate
    | MessageUpdate
    | MessageDelete
    | MessageDeleteBulk
    | MessageReactionAdd
    | MessageReactionRemove
    | MessageReactionRemoveAll
    | MessageReactionRemoveEmoji
    | PresenceUpdate
    | StageInstanceCreate
    | StageInstanceUpdate
    | StageInstanceDelete
    | TypingStart
    | UserUpdate
    | VoiceStateUpdate
    | VoiceServerUpdate
    | WebhookUpdate;

export type ReceiveOpCodeEvent = Hello
    | Reconnect
    | InvalidSession;

export type ReceiveEvent = ReceiveOpCodeEvent | ReceiveDispatchEvent;

export interface Hello extends BasePayload {
    op: GatewayOpCode.Hello;
    d: {
        heartbeat_interval: number
    };
}

export interface Reconnect extends BasePayload {
    op: GatewayOpCode.Reconnect;
    d: null;
}

export interface InvalidSession extends BasePayload {
    op: GatewayOpCode.InvalidSession;
    /** Is Resumable */
    d: boolean;
}

export interface Ready extends DispatchPayload {
    d: {
        v: number,
        user: UserStructure,
        guilds: Array<UnavailableGuildStructure>,
        session_id: string,
        resume_gateway_url: string,
        shard?: [number, number],
        application: Partial<ApplicationStructure>
    };
    t: GatewayEvent.Ready;
}

export interface Resumed extends DispatchPayload {
    t: GatewayEvent.Resumed;
}

export interface ApplicationCommandPermissionsUpdate extends DispatchPayload {
    d: ApplicationCommandPermissionsStructure;
    t: GatewayEvent.ApplicationCommandPermissionsUpdate;
}

export interface AutoModerationRuleCreate extends DispatchPayload {
    d: AutoModerationRuleStructure;
    t: GatewayEvent.AutoModerationRuleCreate;
}

export interface AutoModerationRuleUpdate extends DispatchPayload {
    d: AutoModerationRuleStructure;
    t: GatewayEvent.AutoModerationRuleUpdate;
}

export interface AutoModerationRuleDelete extends DispatchPayload {
    d: AutoModerationRuleStructure;
    t: GatewayEvent.AutoModerationRuleDelete;
}

export interface AutoModerationActionExecution extends DispatchPayload {
    d: {
        guild_id: string,
        action: AutoModerationActionStructure,
        rule_id: string,
        rule_trigger_type: AutoModerationTriggerType,
        user_id: string,
        channel_id?: string,
        message_id?: string,
        alert_system_message_id?: string,
        content: string,
        matched_keyword: string | null,
        matched_content: string | null
    };
    t: GatewayEvent.AutoModerationActionExecution;
}

export interface ChannelCreate extends DispatchPayload {
    d: ChannelStructure;
    t: GatewayEvent.ChannelCreate;
}

export interface ChannelUpdate extends DispatchPayload {
    d: ChannelStructure;
    t: GatewayEvent.ChannelUpdate;
}

export interface ChannelDelete extends DispatchPayload {
    d: ChannelStructure;
    t: GatewayEvent.ChannelDelete;
}

export interface ChannelPinsUpdate extends DispatchPayload {
    d: {
        guild_id?: string,
        channel_id: string,
        /** ISO8601 Timestamp */
        last_pin_timestamp?: string | null
    };
    t: GatewayEvent.ChannelPinsUpdate;
}

export interface ThreadCreate extends DispatchPayload {
    d: ChannelStructure & {
        newly_created: boolean,
        // ThreadChannelStructure
        member: ThreadMemberStructure | undefined
    };
    t: GatewayEvent.ThreadCreate;
}

export interface ThreadUpdate extends DispatchPayload {
    d: ChannelStructure;
    t: GatewayEvent.ThreadUpdate;
}

export interface ThreadDelete extends DispatchPayload {
    d: Pick<ThreadChannelStructure, "id" | "guild_id" | "parent_id" | "type">;
    t: GatewayEvent.ThreadDelete;
}

export interface ThreadListSync extends DispatchPayload {
    d: {
        guild_id: string,
        channel_ids?: Array<string>,
        threads: Array<ChannelStructure>,
        members: Array<ThreadMemberStructure>
    };
    t: GatewayEvent.ThreadListSync;
}

export interface ThreadMemberUpdate extends DispatchPayload {
    d: ThreadMemberStructure & {
        guild_id: string
    };
    t: GatewayEvent.ThreadMemberUpdate;
}

export interface ThreadMembersUpdate extends DispatchPayload {
    d: {
        id: string,
        guild_id: string,
        member_count: number,
        added_members?: Array<ThreadMemberStructure & GuildMemberStructure & (PresenceUpdateEventFields | null)>,
        removed_member_ids?: Array<string>
    };
    t: GatewayEvent.ThreadMembersUpdate;
}

export interface GuildCreate extends DispatchPayload {
    d: UnavailableGuildStructure | (GuildStructure & {
        /** ISO8601 Timestamp */
        joined_at: string,
        large: boolean,
        unavailable?: boolean,
        member_count: number,
        voice_states: Array<Partial<VoiceStateStructure>>,
        members: Array<GuildMemberStructure>,
        channels: Array<ChannelStructure>,
        threads: Array<ChannelStructure>,
        presences: Array<Partial<PresenceUpdateEventFields>>,
        stage_instances: Array<StageInstanceStructure>,
        guild_scheduled_events: Array<GuildScheduleEventStructure>
    });
    t: GatewayEvent.GuildCreate;
}

export interface GuildUpdate extends DispatchPayload {
    d: GuildStructure;
    t: GatewayEvent.GuildUpdate;
}

export interface GuildDelete extends DispatchPayload {
    d: UnavailableGuildStructure;
    t: GatewayEvent.GuildDelete;
}

export interface GuildAuditLogEntryCreate extends DispatchPayload {
    d: AuditLogEntryStructure;
    t: GatewayEvent.GuildAuditLogEntryCreate;
}

export interface GuildBanAdd extends DispatchPayload {
    d: {
        guild_id: string,
        user: UserStructure
    };
    t: GatewayEvent.GuildBanAdd;
}

export interface GuildBanRemove extends DispatchPayload {
    d: {
        guild_id: string,
        user: UserStructure
    };
    t: GatewayEvent.GuildBanRemove;
}

export interface GuildEmojisUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        emojis: Array<EmojiStructure>
    };
    t: GatewayEvent.GuildEmojisUpdate;
}

export interface GuildStickersUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        stickers: Array<StickerStructure>
    };
    t: GatewayEvent.GuildStickersUpdate;
}

export interface GuildIntegrationsUpdate extends DispatchPayload {
    d: {
        guild_id: string
    };
    t: GatewayEvent.GuildIntegrationsUpdate;
}

export interface GuildMemberAdd extends DispatchPayload {
    d: GuildMemberStructure & {
        guild_id: string
    };
    t: GatewayEvent.GuildMemberAdd;
}

export interface GuildMemberRemove extends DispatchPayload {
    d: {
        guild_id: string,
        user: UserStructure
    };
    t: GatewayEvent.GuildMemberRemove;
}

export interface GuildMemberUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        roles: Array<string>,
        user: UserStructure,
        nick?: string | null,
        avatar: string | null,
        /** ISO8601 Timestamp */
        joined_at: string | null,
        /** ISO8601 Timestamp */
        premium_since?: string | null,
        deaf?: boolean,
        mute?: boolean,
        pending?: boolean,
        /** ISO8601 Timestamp */
        communication_disabled_until?: string | null
    };
    t: GatewayEvent.GuildMemberUpdate;
}

export interface GuildMembersChunk extends DispatchPayload {
    d: {
        guild_id: string,
        members: Array<GuildMemberStructure>,
        chunk_index: number,
        chunk_count: number,
        not_found?: Array<string>,
        presences?: Array<PresenceUpdateEventFields>,
        nonce?: string
    };
    t: GatewayEvent.GuildMembersChunk;
}

export interface GuildRoleCreate extends DispatchPayload {
    d: {
        guild_id: string,
        role: RoleStructure
    };
    t: GatewayEvent.GuildRoleCreate;
}

export interface GuildRoleUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        role: RoleStructure
    };
    t: GatewayEvent.GuildRoleUpdate;
}

export interface GuildRoleDelete extends DispatchPayload {
    d: {
        guild_id: string,
        role_id: string
    };
    t: GatewayEvent.GuildRoleDelete;
}

export interface GuildScheduledEventCreate extends DispatchPayload {
    d: GuildScheduleEventStructure;
    t: GatewayEvent.GuildScheduledEventCreate;
}

export interface GuildScheduledEventUpdate extends DispatchPayload {
    d: GuildScheduleEventStructure;
    t: GatewayEvent.GuildScheduledEventUpdate;
}

export interface GuildScheduledEventDelete extends DispatchPayload {
    d: GuildScheduleEventStructure;
    t: GatewayEvent.GuildScheduledEventDelete;
}

export interface GuildScheduledEventUserAdd extends DispatchPayload {
    d: {
        guild_scheduled_event_id: string,
        user_id: string,
        guild_id: string
    };
    t: GatewayEvent.GuildScheduledEventUserAdd;
}

export interface GuildScheduledEventUserRemove extends DispatchPayload {
    d: {
        guild_scheduled_event_id: string,
        user_id: string,
        guild_id: string
    };
    t: GatewayEvent.GuildScheduledEventUserRemove;
}

export interface IntegrationCreate extends DispatchPayload {
    d: IntegrationStructure & {
        guild_id: string
    };
    t: GatewayEvent.IntegrationCreate;
}

export interface IntegrationUpdate extends DispatchPayload {
    d: IntegrationStructure & {
        guild_id: string
    };
    t: GatewayEvent.IntegrationUpdate;
}

export interface IntegrationDelete extends DispatchPayload {
    d: {
        id: string,
        guild_id: string,
        application_id?: string
    };
    t: GatewayEvent.IntegrationDelete;
}

export interface InteractionCreate extends DispatchPayload {
    d: InteractionStructure;
    t: GatewayEvent.InteractionCreate;
}

export interface InviteCreate extends DispatchPayload {
    d: {
        channel_id: string,
        code: string,
        /** ISO8601 Timestamp */
        created_at: string,
        guild_id?: string,
        inviter?: UserStructure,
        max_age: number,
        max_uses: number,
        target_type?: InviteTargetType,
        target_user?: UserStructure,
        target_application?: Partial<ApplicationStructure>,
        temporary: boolean,
        uses: number
    };
    t: GatewayEvent.InviteCreate;
}

export interface InviteDelete extends DispatchPayload {
    d: {
        channel_id: string,
        guild_id?: string,
        code: string
    };
    t: GatewayEvent.InviteCreate;
}

export interface MessageCreate extends DispatchPayload {
    d: MessageStructure & {
        guild_id?: string,
        member?: Partial<GuildMemberStructure>,
        mentions: Array<UserStructure & { member?: Partial<GuildMemberStructure> }>
    };
    t: GatewayEvent.MessageCreate;
}

export interface MessageUpdate extends DispatchPayload {
    d: Partial<MessageStructure> & {
        guild_id?: string,
        member?: Partial<GuildMemberStructure>,
        mentions: Array<UserStructure & { member?: Partial<GuildMemberStructure> }>
    };
    t: GatewayEvent.MessageUpdate;
}

export interface MessageDelete extends DispatchPayload {
    d: {
        id: string,
        channel_id: string,
        guild_id?: string
    };
    t: GatewayEvent.MessageDelete;
}

export interface MessageDeleteBulk extends DispatchPayload {
    d: {
        ids: Array<string>,
        channel_id: string,
        guild_id?: string
    };
    t: GatewayEvent.MessageDeleteBulk;
}

export interface MessageReactionAdd extends DispatchPayload {
    d: {
        user_id: string,
        channel_id: string,
        message_id: string,
        guild_id?: string,
        member?: GuildMemberStructure,
        emoji: Partial<EmojiStructure>,
        message_author_id?: string
    };
    t: GatewayEvent.MessageReactionAdd;
}

export interface MessageReactionRemove extends DispatchPayload {
    d: {
        user_id: string,
        channel_id: string,
        message_id: string,
        guild_id?: string,
        emoji: Partial<EmojiStructure>
    };
    t: GatewayEvent.MessageReactionRemove;
}

export interface MessageReactionRemoveAll extends DispatchPayload {
    d: {
        channel_id: string,
        message_id: string,
        guild_id?: string
    };
    t: GatewayEvent.MessageReactionRemoveAll;
}

export interface MessageReactionRemoveEmoji extends DispatchPayload {
    d: {
        channel_id: string,
        guild_id?: string,
        message_id: string,
        emoji: Partial<EmojiStructure>
    };
    t: GatewayEvent.MessageReactionRemoveEmoji;
}

export interface PresenceUpdate extends DispatchPayload {
    d: {
        /** Only `id` will always exist */
        user: Partial<UserStructure> & Pick<UserStructure, "id">,
        guild_id: string,
        status: Status,
        activities: Array<ActivityStructure>,
        client_status: {
            desktop?: Status,
            mobile?: Status,
            web?: Status
        }
    };
    t: GatewayEvent.PresenceUpdate;
}

export interface StageInstanceCreate extends DispatchPayload {
    d: StageInstanceStructure;
    t: GatewayEvent.StageInstanceCreate;
}

export interface StageInstanceUpdate extends DispatchPayload {
    d: StageInstanceStructure;
    t: GatewayEvent.StageInstanceUpdate;
}

export interface StageInstanceDelete extends DispatchPayload {
    d: StageInstanceStructure;
    t: GatewayEvent.StageInstanceDelete;
}

export interface TypingStart extends DispatchPayload {
    d: {
        channel_id: string,
        guild_id?: string,
        user_id: string,
        timestamp: number,
        member?: GuildMemberStructure
    };
    t: GatewayEvent.TypingStart;
}

export interface UserUpdate extends DispatchPayload {
    d: UserStructure;
    t: GatewayEvent.UserUpdate;
}

export interface VoiceStateUpdate extends DispatchPayload {
    d: VoiceStateStructure;
    t: GatewayEvent.VoiceStateUpdate;
}

export interface VoiceServerUpdate extends DispatchPayload {
    d: {
        token: string,
        guild_id: string,
        endpoint: string | null
    };
    t: GatewayEvent.VoiceServerUpdate;
}

export interface WebhookUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        channel_id: string
    };
    t: GatewayEvent.WebhookUpdate;
}

//#endregion ReceiveEvent