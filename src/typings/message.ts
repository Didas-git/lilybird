import type { MessageActivityType, MessageFlags, MessageType } from "../enums";

import type {
    RoleSubscriptionDataStructure,
    MessageInteractionStructure,
    ChannelMentionStructure,
    ResolvedDataStructure,
    StickerItemStructure,
    ApplicationStructure,
    AttachmentStructure,
    MessageComponentStructure,
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
    content: string;
    /** ISO8601 Timestamp */
    timestamp: string;
    /** ISO8601 Timestamp */
    edited_timestamp: string | null;
    tts: boolean;
    mention_everyone: boolean;
    mentions: Array<UserStructure>;
    mention_roles: Array<RoleStructure>;
    mention_channels: Array<ChannelMentionStructure>;
    attachments: Array<AttachmentStructure>;
    embeds: Array<EmbedStructure>;
    reactions: Array<ReactionStructure>;
    nonce?: number | string;
    pinned: boolean;
    webhook_id?: string;
    type: MessageType;
    activity: MessageActivityStructure;
    application?: Partial<ApplicationStructure>;
    application_id?: string;
    message_reference?: MessageReferenceStructure;
    flags?: MessageFlags;
    referenced_message?: MessageStructure | null;
    interaction?: MessageInteractionStructure;
    thread?: ChannelStructure;
    components?: Array<MessageComponentStructure>;
    sticker_items?: Array<StickerItemStructure>;
    stickers?: Array<StickerStructure>;
    position?: number;
    role_subscription_data?: RoleSubscriptionDataStructure;
    resolved?: ResolvedDataStructure;
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