import type { AutoModerationTriggerType, InviteTargetType, GatewayOpCode, GatewayEvent } from "#enums";
import type { ActivityStructure, BotActivityStructure } from "./activity.js";
import type { ApplicationCommand } from "./application-command.js";
import type { AutoModeration } from "./auto-moderation.js";
import type { StageInstance } from "./stage-instance.js";
import type { Application } from "./application.js";
import type { Interaction } from "./interaction.js";
import type { AuditLog } from "./audit-log.js";
import type { Channel } from "./channel.js";
import type { Message } from "./message.js";
import type { Sticker } from "./sticker.js";
import type { Emoji } from "./emoji.js";
import type { Guild } from "./guild.js";
import type { Voice } from "./voice.js";
import type { Role } from "./role.js";
import type { User } from "./user.js";

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

export interface SessionStartLimit {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
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
    activities: Array<BotActivityStructure>;
    status: Status;
    afk: boolean;
}

export interface PresenceUpdateEventFields {
    user: Partial<User.Structure> & {
        id: string
    };
    guild_id: string;
    status: string;
    activities: Array<ActivityStructure>;
    client_status: ClientStatus;
}

//#region SendEvent

export type SendEvent = Identify | Resume | Heartbeat | RequestGuildMembers | UpdateVoiceState | UpdatePresence | HeartbeatACK;

export interface Identify extends BasePayload {
    op: GatewayOpCode.Identify;
    d: {
        token: string,
        properties: {
            os: string,
            browser: "Lilybird",
            device: "Lilybird"
        },
        /** @default false */
        compress?: boolean,
        /**
         * Value between 50 and 250
         * @default 50
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

export type ReceiveDispatchEvent =
    | Ready // X
    | Resumed // X
    | ApplicationCommandPermissionsUpdate
    | AutoModerationRuleCreate
    | AutoModerationRuleUpdate
    | AutoModerationRuleDelete
    | AutoModerationActionExecution
    | ChannelCreate // X
    | ChannelUpdate // X
    | ChannelDelete // X
    | ChannelPinsUpdate // X
    | ThreadCreate // X
    | ThreadUpdate // X
    | ThreadDelete // X
    | ThreadListSync
    | ThreadMemberUpdate
    | ThreadMembersUpdate
    | GuildCreate // X
    | GuildUpdate // X
    | GuildDelete // X
    | GuildAuditLogEntryCreate
    | GuildBanAdd
    | GuildBanRemove
    | GuildEmojisUpdate
    | GuildStickersUpdate
    | GuildIntegrationsUpdate
    | GuildMemberAdd // X
    | GuildMemberRemove // X
    | GuildMemberUpdate // X
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
    | InteractionCreate // X
    | InviteCreate // X
    | InviteDelete // X
    | MessageCreate // X
    | MessageUpdate // X
    | MessageDelete // X
    | MessageDeleteBulk // X
    | MessageReactionAdd
    | MessageReactionRemove
    | MessageReactionRemoveAll
    | MessageReactionRemoveEmoji
    | PresenceUpdate // X
    | StageInstanceCreate
    | StageInstanceUpdate
    | StageInstanceDelete
    | TypingStart
    | UserUpdate // X
    | VoiceStateUpdate
    | VoiceServerUpdate
    | WebhookUpdate;

export type ReceiveOpCodeEvent = Hello | Reconnect | InvalidSession;

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
        user: User.Structure,
        guilds: Array<Guild.UnavailableStructure>,
        session_id: string,
        resume_gateway_url: string,
        shard?: [number, number],
        application: Partial<Application.Structure>
    };
    t: GatewayEvent.Ready;
}

export interface Resumed extends DispatchPayload {
    t: GatewayEvent.Resumed;
}

export interface ApplicationCommandPermissionsUpdate extends DispatchPayload {
    d: ApplicationCommand.PermissionsStructure;
    t: GatewayEvent.ApplicationCommandPermissionsUpdate;
}

export interface AutoModerationRuleCreate extends DispatchPayload {
    d: AutoModeration.RuleStructure;
    t: GatewayEvent.AutoModerationRuleCreate;
}

export interface AutoModerationRuleUpdate extends DispatchPayload {
    d: AutoModeration.RuleStructure;
    t: GatewayEvent.AutoModerationRuleUpdate;
}

export interface AutoModerationRuleDelete extends DispatchPayload {
    d: AutoModeration.RuleStructure;
    t: GatewayEvent.AutoModerationRuleDelete;
}

export interface AutoModerationActionExecution extends DispatchPayload {
    d: {
        guild_id: string,
        action: AutoModeration.ActionStructure,
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
    d: Channel.Structure;
    t: GatewayEvent.ChannelCreate;
}

export interface ChannelUpdate extends DispatchPayload {
    d: Channel.Structure;
    t: GatewayEvent.ChannelUpdate;
}

export interface ChannelDelete extends DispatchPayload {
    d: Channel.Structure;
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
    d: Channel.Structure & {
        newly_created: boolean,
        // ThreadChannelStructure
        member: Channel.ThreadMemberStructure | undefined
    };
    t: GatewayEvent.ThreadCreate;
}

export interface ThreadUpdate extends DispatchPayload {
    d: Channel.Structure;
    t: GatewayEvent.ThreadUpdate;
}

export interface ThreadDelete extends DispatchPayload {
    d: Pick<Channel.ThreadChannelStructure, "id" | "guild_id" | "parent_id" | "type">;
    t: GatewayEvent.ThreadDelete;
}

export interface ThreadListSync extends DispatchPayload {
    d: {
        guild_id: string,
        channel_ids?: Array<string>,
        threads: Array<Channel.Structure>,
        members: Array<Channel.ThreadMemberStructure>
    };
    t: GatewayEvent.ThreadListSync;
}

export interface ThreadMemberUpdate extends DispatchPayload {
    d: Channel.ThreadMemberStructure & {
        guild_id: string
    };
    t: GatewayEvent.ThreadMemberUpdate;
}

export interface ThreadMembersUpdate extends DispatchPayload {
    d: {
        id: string,
        guild_id: string,
        member_count: number,
        added_members?: Array<Channel.ThreadMemberStructure & Guild.MemberStructure & (PresenceUpdateEventFields | null)>,
        removed_member_ids?: Array<string>
    };
    t: GatewayEvent.ThreadMembersUpdate;
}

export interface GuildCreate extends DispatchPayload {
    d: Guild.UnavailableStructure | Guild.New;
    t: GatewayEvent.GuildCreate;
}

export interface GuildUpdate extends DispatchPayload {
    d: Guild.Structure;
    t: GatewayEvent.GuildUpdate;
}

export interface GuildDelete extends DispatchPayload {
    d: Guild.UnavailableStructure;
    t: GatewayEvent.GuildDelete;
}

export interface GuildAuditLogEntryCreate extends DispatchPayload {
    d: AuditLog.EntryStructure;
    t: GatewayEvent.GuildAuditLogEntryCreate;
}

export interface GuildBanAdd extends DispatchPayload {
    d: {
        guild_id: string,
        user: User.Structure
    };
    t: GatewayEvent.GuildBanAdd;
}

export interface GuildBanRemove extends DispatchPayload {
    d: {
        guild_id: string,
        user: User.Structure
    };
    t: GatewayEvent.GuildBanRemove;
}

export interface GuildEmojisUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        emojis: Array<Emoji.Structure>
    };
    t: GatewayEvent.GuildEmojisUpdate;
}

export interface GuildStickersUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        stickers: Array<Sticker.Structure>
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
    d: Guild.MemberStructure & {
        guild_id: string
    };
    t: GatewayEvent.GuildMemberAdd;
}

export interface GuildMemberRemove extends DispatchPayload {
    d: {
        guild_id: string,
        user: User.Structure
    };
    t: GatewayEvent.GuildMemberRemove;
}

export interface GuildMemberUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        roles: Array<string>,
        user: User.Structure,
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
        members: Array<Guild.MemberStructure>,
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
        role: Role.Structure
    };
    t: GatewayEvent.GuildRoleCreate;
}

export interface GuildRoleUpdate extends DispatchPayload {
    d: {
        guild_id: string,
        role: Role.Structure
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
    d: Guild.ScheduledEventStructure;
    t: GatewayEvent.GuildScheduledEventCreate;
}

export interface GuildScheduledEventUpdate extends DispatchPayload {
    d: Guild.ScheduledEventStructure;
    t: GatewayEvent.GuildScheduledEventUpdate;
}

export interface GuildScheduledEventDelete extends DispatchPayload {
    d: Guild.ScheduledEventStructure;
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
    d: Guild.IntegrationStructure & {
        guild_id: string
    };
    t: GatewayEvent.IntegrationCreate;
}

export interface IntegrationUpdate extends DispatchPayload {
    d: Guild.IntegrationStructure & {
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
    d: Interaction.Structure;
    t: GatewayEvent.InteractionCreate;
}

export interface InviteCreate extends DispatchPayload {
    d: {
        channel_id: string,
        code: string,
        /** ISO8601 Timestamp */
        created_at: string,
        guild_id?: string,
        inviter?: User.Structure,
        max_age: number,
        max_uses: number,
        target_type?: InviteTargetType,
        target_user?: User.Structure,
        target_application?: Partial<Application.Structure>,
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
    t: GatewayEvent.InviteDelete;
}

export interface MessageCreate extends DispatchPayload {
    d: Message.GuildStructure;
    t: GatewayEvent.MessageCreate;
}

export interface MessageUpdate extends DispatchPayload {
    d: Partial<Message.GuildStructure>;
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
        member?: Guild.MemberStructure,
        emoji: Partial<Emoji.Structure>,
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
        emoji: Partial<Emoji.Structure>
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
        emoji: Partial<Emoji.Structure>
    };
    t: GatewayEvent.MessageReactionRemoveEmoji;
}

export interface PresenceUpdate extends DispatchPayload {
    d: {
        /** Only `id` will always exist */
        user: Partial<User.Structure> & Pick<User.Structure, "id">,
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
    d: StageInstance.Structure;
    t: GatewayEvent.StageInstanceCreate;
}

export interface StageInstanceUpdate extends DispatchPayload {
    d: StageInstance.Structure;
    t: GatewayEvent.StageInstanceUpdate;
}

export interface StageInstanceDelete extends DispatchPayload {
    d: StageInstance.Structure;
    t: GatewayEvent.StageInstanceDelete;
}

export interface TypingStart extends DispatchPayload {
    d: {
        channel_id: string,
        guild_id?: string,
        user_id: string,
        timestamp: number,
        member?: Guild.MemberStructure
    };
    t: GatewayEvent.TypingStart;
}

export interface UserUpdate extends DispatchPayload {
    d: User.Structure;
    t: GatewayEvent.UserUpdate;
}

export interface VoiceStateUpdate extends DispatchPayload {
    d: Voice.StateStructure;
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
