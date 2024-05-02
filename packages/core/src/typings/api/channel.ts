import type { AllowedMentionsStructure, AttachmentStructure, EmbedStructure, OverwriteStructure } from "../shared/index.js";
import type { ChannelType, ForumLayoutType, InviteTargetType, SortOrderType, VideoQualityMode } from "#enums";

import type {
    MessageComponentStructure,
    MessageReferenceStructure,
    DefaultReactionStructure,
    ThreadMemberStructure,
    AutoArchiveDuration,
    LilybirdAttachment,
    ForumTagStructure,
    ChannelStructure
} from "../index.js";

export interface CreateMessageStructure {
    content?: string;
    nonce?: number | string;
    tts?: boolean;
    embeds?: Array<EmbedStructure>;
    allowed_mentions?: AllowedMentionsStructure;
    message_reference?: MessageReferenceStructure;
    components?: Array<MessageComponentStructure>;
    sticker_ids?: Array<string>;
    files?: Array<LilybirdAttachment>;
    payload_json?: string;
    attachments?: Array<Partial<AttachmentStructure>>;
    flags?: number;
    enforce_nonce?: boolean;
}

export interface EditMessageStructure {
    content?: string;
    embeds?: Array<EmbedStructure>;
    flags?: number;
    allowed_mentions?: AllowedMentionsStructure;
    components?: Array<MessageComponentStructure>;
    files?: Array<LilybirdAttachment>;
    payload_json?: string;
    attachments?: Array<AttachmentStructure>;
}

export interface CreateChannelInviteStructure {
    reason?: string;
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
    target_type?: InviteTargetType;
    target_user_id?: string;
    target_application_id?: string;
}

export interface CreateThreadFromMessageStructure {
    name: string;
    auto_archive_duration?: number;
    rate_limit_per_user?: number | null;
    reason?: string;
}

export interface CreateThreadStructure extends CreateThreadFromMessageStructure {
    /** https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params */
    type?: ChannelType;
    invitable?: boolean;
}

export interface CreateForumMediaThreadStructure extends CreateThreadFromMessageStructure {
    message: ForumThreadMessageParamsStructure;
    applied_tags?: Array<string>;
    files?: Array<LilybirdAttachment>;
    payload_json?: string;
}

export interface ForumThreadMessageParamsStructure {
    content?: string;
    embeds?: Array<EmbedStructure>;
    allowed_mentions?: AllowedMentionsStructure;
    components?: Array<MessageComponentStructure>;
    sticker_ids?: Array<string>;
    attachments?: Array<Partial<AttachmentStructure>>;
    flags?: number;
}

export interface ListArchivedThreadsReturnStructure {
    threads: Array<ChannelStructure>;
    members: Array<ThreadMemberStructure>;
    has_more: boolean;
}
