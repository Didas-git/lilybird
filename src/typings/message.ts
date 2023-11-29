import type { MessageActivityType, MessageFlags, MessageType } from "../enums";

import type {
    RoleSubscriptionDataStructure,
    MessageInteractionStructure,
    MessageComponentStructure,
    ChannelMentionStructure,
    ResolvedDataStructure,
    GuildMemberStructure,
    StickerItemStructure,
    ApplicationStructure,
    AttachmentStructure,
    ChannelStructure,
    StickerStructure,
    EmbedStructure,
    EmojiStructure,
    UserStructure,
    RoleStructure
} from ".";

export interface MessageStructure {
    id: string;
    channel_id: string;
    author: UserStructure;
    // This does not exist without the intent
    content: string;
    /** ISO8601 Timestamp */
    timestamp: string;
    /** ISO8601 Timestamp */
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: Array<UserStructure>;
    mention_roles: Array<RoleStructure>;
    mention_channels?: Array<ChannelMentionStructure>;
    // This does not exist without the intent
    attachments: Array<AttachmentStructure>;
    // This does not exist without the intent
    embeds: Array<EmbedStructure>;
    reactions: Array<ReactionStructure>;
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: string;
    type: MessageType;
    activity?: MessageActivityStructure;
    application?: Partial<ApplicationStructure>;
    application_id?: string;
    message_reference?: MessageReferenceStructure;
    flags?: MessageFlags;
    referenced_message?: MessageStructure | null;
    interaction?: MessageInteractionStructure;
    thread?: ChannelStructure;
    // This does not exist without the intent
    components?: Array<MessageComponentStructure>;
    sticker_items?: Array<StickerItemStructure>;
    stickers?: Array<StickerStructure>;
    position?: number;
    role_subscription_data?: RoleSubscriptionDataStructure;
    resolved?: ResolvedDataStructure;
}

export interface GuildMessageStructure extends MessageStructure {
    guild_id?: string;
    member?: Partial<GuildMemberStructure>;
    mentions: Array<UserStructure & { member?: Partial<GuildMemberStructure> }>;
}

export interface MessageActivityStructure {
    type: MessageActivityType;
    party_id?: string;
}

export interface ReactionStructure {
    count: number;
    count_details: ReactionCountDetailsStructure;
    me: boolean;
    me_burst: boolean;
    emoji: Partial<EmojiStructure>;
    burst_colors: Array<number>;
}

export interface ReactionCountDetailsStructure {
    burst: number;
    normal: number;
}

export interface MessageReferenceStructure {
    message_id?: string;
    channel_id?: string;
    guild_id?: string;
    fail_if_not_exists?: boolean;
}